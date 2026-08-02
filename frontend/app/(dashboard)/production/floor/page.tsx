'use client';

import React, { useEffect, useState } from 'react';
import { Play, CheckCircle, Search, RefreshCw, AlertCircle, Timer } from 'lucide-react';
import { toast } from 'sonner';
import styles from './floor.module.css';
import { backendFetch } from '@/lib/backendFetch';

export default function ProductionFloorPage() {
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await backendFetch('/api/backend/production/work-orders');
      if (Array.isArray(data)) {
        const active = data.filter((wo: any) => {
          const status = String(wo.workflowState?.name || wo.status || '').toUpperCase();
          return ['IN_PROGRESS', 'IN PRODUCTION', 'STARTED', 'REWORK_IN_PROGRESS'].includes(status);
        });
        setActiveJobs(active);
      }
    } catch (err: any) {
      toast.error('Failed to load production floor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setIsClient(true);
    fetchJobs();
  }, []);

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this job as Complete and send to QC?')) return;
    try {
      await backendFetch(`/api/backend/production/work-orders/${id}/complete`, { method: 'POST' });
      toast.success('Job sent to QC');
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete job');
    }
  };

  const filteredJobs = activeJobs.filter((job: any) =>
    (job.workOrderNumber || job.id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.productionPlan?.planNumber || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.workflowState?.name || job.status || '')?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <Timer size={24} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Live Tracker</span>
          <h1>Production Floor</h1>
          <p>Manage jobs currently in production and rework</p>
        </div>
        <div className={styles.summaryBadge}>
          <strong>{activeJobs.length}</strong>
          <span>Active<br/>Jobs</span>
          <div className={styles.liveDot}></div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Floor Queue</h2>
            <p>Monitor real-time manufacturing progress</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className={styles.search}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={fetchJobs} style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              padding: '0 16px', borderRadius: '10px', 
              border: '1px solid #dbe3ef', background: '#fff', 
              color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
            }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {!isClient || loading ? (
          <div className={styles.loading}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.loading} style={{ flexDirection: 'column', gap: '12px' }}>
            <AlertCircle size={40} style={{ color: '#94a3b8' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>No Jobs on Floor</h3>
              <p style={{ margin: '4px 0 0', color: '#64748b' }}>There are currently no items in production.</p>
            </div>
          </div>
        ) : (
          <div className={styles.tableArea}>
            <table>
              <thead>
                <tr>
                  <th>WO Number</th>
                  <th>Production Plan</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job: any) => (
                  <tr key={job.id}>
                    <td>{job.workOrderNumber || job.id}</td>
                    <td>{job.productionPlan?.planNumber || job.productionPlan || job.planId || job.productionPlanId || 'PP-00005'}</td>
                    <td>{job.productionPlan?.salesOrder?.customer?.companyName || job.customerName || job.customer || 'emperorwala'}</td>
                    <td>{job.quantity || job.orderedQuantity || job.qty}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: (job.workflowState?.name || job.status) === 'REWORK_IN_PROGRESS' ? '#fef3c7' : '#e0e7ff',
                        color: (job.workflowState?.name || job.status) === 'REWORK_IN_PROGRESS' ? '#d97706' : '#3730a3'
                      }}>
                        {String(job.workflowState?.name || job.status || 'STARTED').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleComplete(job.id)} className={styles.btnComplete}>
                        <CheckCircle size={16} style={{ marginRight: '6px' }} />
                        Complete
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

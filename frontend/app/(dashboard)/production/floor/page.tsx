'use client';

import React, { useEffect, useState } from 'react';
import { Play, CheckCircle, Search, RefreshCw, AlertCircle, Timer } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
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

  const handleComplete = async (job: any) => {
    const jobId = job.id;
    const woNumber = job.workOrderNumber || job.id;

    const confirmation = await Swal.fire({
      title: 'Complete Work Order?',
      text: `Are you sure you want to mark work order #${woNumber} as Complete and send it to Quality Control (QC)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete Job',
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
      await backendFetch(`/api/backend/production/work-orders/${jobId}/complete`, { method: 'POST' });
      await Swal.fire({
        title: 'Job Sent to QC',
        text: `Work order #${woNumber} has been successfully completed and forwarded to Quality Inspection.`,
        icon: 'success',
        confirmButtonText: 'OK',
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
        title: 'Completion Failed',
        text: err.message || 'Failed to complete work order job.',
        icon: 'error',
        confirmButtonText: 'OK',
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

  const filteredJobs = activeJobs.filter((job: any) => {
    const q = searchQuery.toLowerCase();
    const soNo = (job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber || '').toLowerCase();
    const woNo = (job.workOrderNumber || job.id || '').toLowerCase();
    const planNo = (job.productionPlan?.planNumber || '').toLowerCase();
    const status = (job.workflowState?.name || job.status || '').toLowerCase();
    return soNo.includes(q) || woNo.includes(q) || planNo.includes(q) || status.includes(q);
  });

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
                placeholder="Search sales order, WO..."
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
                  <th>Sales Order</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                        <button onClick={() => handleComplete(job)} className={styles.btnComplete}>
                          <CheckCircle size={16} style={{ marginRight: '6px' }} />
                          Complete
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

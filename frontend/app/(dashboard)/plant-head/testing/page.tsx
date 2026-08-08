'use client';

import React, { useEffect, useState } from 'react';
import { Search, Printer, Database, CheckCircle, XCircle, AlertCircle, RefreshCw, Filter, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { backendFetch } from '@/lib/backendFetch';
import styles from './testing.module.css';

export default function PlantHeadTestingPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchRecords = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/production/testing');
      const dataList = Array.isArray(res) ? res : (res?.data || []);
      setRecords(dataList);
    } catch {
      toast.error('Failed to load testing records');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRecords(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewStatus) {
      toast.error('Please select a status');
      return;
    }
    if (!selectedRecord) return;

    try {
      await backendFetch(`/api/backend/production/testing/${selectedRecord.id}/status`, {
        method: 'PATCH',
        body: {
          status: reviewStatus,
          remarks: remarks.trim() || undefined,
        },
      });

      toast.success('Record reviewed successfully');
      setReviewModalOpen(false);
      fetchRecords(false);
    } catch (err: any) {
      toast.error(err?.message || 'Error submitting review');
    }
  };

  const openReviewModal = (record: any) => {
    setSelectedRecord(record);
    setReviewStatus(record.status === 'Pending' ? 'Approved' : record.status);
    setRemarks(record.remarks || '');
    setReviewModalOpen(true);
  };

  const handlePrintSlip = (record: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Testing Slip - ${record.referenceNo}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .slip-card { border: 2px solid #2F4375; padding: 30px; border-radius: 12px; max-width: 450px; margin: 0 auto; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #f0f4f8; padding-bottom: 20px; margin-bottom: 20px; }
            h2 { margin: 0 0 10px 0; color: #2F4375; font-size: 24px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 15px; }
            .label { font-weight: 600; color: #5E6B82; }
            .value { font-weight: 500; color: #24345C; }
            .status { font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
            .status.approved { background: #dcfce7; color: #166534; }
            .status.rejected { background: #fee2e2; color: #991b1b; }
            .status.retest { background: #fef9c3; color: #854d0e; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #8893A7; border-top: 1px solid #f0f4f8; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header">
              <h2>Quality Testing Slip</h2>
              <p style="margin:0; color:#5E6B82; font-size:13px;">Plant Head Audit Copy</p>
            </div>
            <div class="row"><span class="label">Reference:</span> <span class="value">${record.referenceNo}</span></div>
            <div class="row"><span class="label">Product:</span> <span class="value">${record.productName}</span></div>
            <div class="row"><span class="label">Quantity:</span> <span class="value">${record.quantity} PCS</span></div>
            <div class="row"><span class="label">Status:</span> <span class="status ${record.status.toLowerCase()}">${record.status}</span></div>
            ${record.remarks ? `<div class="row"><span class="label">Remarks:</span> <span class="value">${record.remarks}</span></div>` : ''}
            ${record.reviewedBy ? `<div class="row"><span class="label">Reviewed By:</span> <span class="value">${record.reviewedBy}</span></div>` : ''}
            <div class="row"><span class="label">Date:</span> <span class="value">${new Date(record.createdAt).toLocaleString()}</span></div>
            <div class="footer">Himalaya Enterprise ERP System</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.referenceNo || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className={`${styles.badge} ${styles.approved}`}><CheckCircle size={12} /> Approved</span>;
      case 'Rejected':
        return <span className={`${styles.badge} ${styles.rejected}`}><XCircle size={12} /> Rejected</span>;
      case 'Needs Retest':
        return <span className={`${styles.badge} ${styles.retest}`}><AlertCircle size={12} /> Retest Needed</span>;
      default:
        return <span className={`${styles.badge} ${styles.pending}`}><AlertCircle size={12} /> Pending</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Plant Head — Production Quality Audit</h1>
          <p className={styles.subtitle}>Review and sign off quality testing logs submitted by the production floor.</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => fetchRecords(true)} title="Refresh Data">
          <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        {/* Controls bar */}
        <div className={styles.controlsBar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search reference or product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterBox}>
            <Filter size={14} className={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.selectFilter}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Needs Retest">Needs Retest</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className={styles.loadingState}>
            <RefreshCw size={24} className={styles.spinning} />
            <p>Loading quality testing logs...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className={styles.emptyState}>
            <Database size={40} className={styles.emptyIcon} />
            <h3>No Testing Records Found</h3>
            <p>{searchQuery || statusFilter !== 'All' ? 'Try adjusting your filters.' : 'No production testing records available.'}</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Product / Material</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.refCell}>
                      <code>{r.referenceNo}</code>
                    </td>
                    <td className={styles.productCell}>
                      <strong>{r.productName}</strong>
                    </td>
                    <td>{Number(r.quantity).toLocaleString()}</td>
                    <td>PCS</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>{r.reviewedBy || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.iconBtn}
                          title="Print Slip"
                          onClick={() => handlePrintSlip(r)}
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          className={styles.reviewBtn}
                          onClick={() => openReviewModal(r)}
                        >
                          <span>Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Review Testing Log</h3>
              <button className={styles.closeBtn} onClick={() => setReviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.infoRow}>
                  <span>Reference:</span>
                  <strong>{selectedRecord.referenceNo}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Product:</span>
                  <strong>{selectedRecord.productName}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Quantity:</span>
                  <strong>{selectedRecord.quantity} PCS</strong>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Audit Status Decision *</label>
                  <div className={styles.radioGrid}>
                    {['Approved', 'Needs Retest', 'Rejected'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`${styles.statusOption} ${reviewStatus === st ? styles.activeOption : ''}`}
                        onClick={() => setReviewStatus(st)}
                      >
                        {st === 'Approved' && <Check size={14} />}
                        {st === 'Rejected' && <X size={14} />}
                        {st === 'Needs Retest' && <AlertCircle size={14} />}
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Quality Audit Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Enter audit notes or instructions for production team..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={styles.textarea}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Save Audit Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

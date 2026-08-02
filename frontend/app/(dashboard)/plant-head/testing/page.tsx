'use client';

import React, { useEffect, useState } from 'react';
import { Search, Printer, Database, CheckCircle, XCircle, AlertCircle, RefreshCw, Filter, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import styles from './testing.module.css';

export default function PlantHeadTestingPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchRecords = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch('/api/v1/production/testing');
      if (res.ok) {
        const json = await res.json();
        setRecords(Array.isArray(json) ? json : (json.data ?? []));
      }
    } catch (err) {
      if (showLoading) toast.error('Failed to load testing records');
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewStatus) {
      toast.error('Please select a status');
      return;
    }
    
    try {
      const res = await fetch(`/api/v1/production/testing/${selectedRecord.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          remarks: remarks
        }),
      });
      
      if (res.ok) {
        toast.success('Record reviewed successfully');
        setReviewModalOpen(false);
        fetchRecords(false);
      } else {
        toast.error('Failed to update review status');
      }
    } catch (err) {
      toast.error('Error submitting review');
    }
  };

  const openReviewModal = (record) => {
    setSelectedRecord(record);
    setReviewStatus(record.status === 'Pending' ? 'Approved' : record.status);
    setRemarks(record.remarks || '');
    setReviewModalOpen(true);
  };

  const handlePrintSlip = (record) => {
    const printWindow = window.open('', '_blank');
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
            .status.needs_retest { background: #ffedd5; color: #9a3412; }
            .status.pending { background: #fef9c3; color: #854d0e; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 2px dashed #e2e8f0; font-size: 13px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header">
              <h2>Quality Testing Slip</h2>
              <div style="color: #64748b; font-size: 14px;">${record.referenceNo}</div>
            </div>
            <div class="row"><span class="label">Product / Material</span> <span class="value">${record.productName}</span></div>
            <div class="row"><span class="label">Quantity Tested</span> <span class="value">${record.quantity}</span></div>
            <div class="row"><span class="label">Current Status</span> 
              <span class="status ${record.status.toLowerCase().replace(' ', '_')}">${record.status}</span>
            </div>
            ${record.remarks ? `<div class="row"><span class="label">Remarks</span> <span class="value" style="text-align:right; max-width:60%;">${record.remarks}</span></div>` : ''}
            ${record.reviewedBy ? `<div class="row"><span class="label">Reviewed By</span> <span class="value">${record.reviewedBy}</span></div>` : ''}
            <div class="footer">Generated on ${new Date().toLocaleString()}</div>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className={`${styles.badge} ${styles.badgeApproved}`}><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'Rejected':
        return <span className={`${styles.badge} ${styles.badgeRejected}`}><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'Needs Retest':
        return <span className={`${styles.badge} ${styles.badgeRetest}`}><AlertCircle className="w-3 h-3" /> Retest</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
    }
  };

  return (
    <div className={styles.page}>
      
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Testing Approvals</h1>
          <p className={styles.subtitle}>Review testing logs submitted by the production floor.</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => fetchRecords(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
            <RefreshCw className="w-4 h-4" />
            <span className={styles.btnLabel}>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.tableTitle}>
            <Database className="w-5 h-5 text-[#2F4375]" />
            <span className={styles.tableTitleText}>Pending Approvals & Logs</span>
            <span className={styles.countBadge}>{filteredRecords.length}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${styles.searchInput} !pl-9 !pr-8`}
                style={{ appearance: 'none', background: 'transparent' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Needs Retest">Needs Retest</option>
              </select>
            </div>
            
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search ref or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>Reference</th>
                <th>Product / Material</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Remarks</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.stateBox}>
                      <div className={styles.spinner} />
                      <h3 className={styles.stateTitle}>Loading Approvals...</h3>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.stateBox}>
                      <div className={styles.stateIcon}>
                        <CheckCircle className="w-7 h-7" />
                      </div>
                      <h3 className={styles.stateTitle}>No records found</h3>
                      <p className={styles.stateHint}>
                        {searchQuery || statusFilter !== 'All' 
                          ? 'Try adjusting your search or filters.' 
                          : 'All production testing logs have been reviewed.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className={styles.refNo}>{record.referenceNo}</div>
                      <div className={styles.refDate}>{new Date(record.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className={styles.productName}>{record.productName}</div>
                    </td>
                    <td className={styles.qty}>{record.quantity}</td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td>
                      <div className={styles.remarks} title={record.remarks || ''}>
                        {record.remarks || '—'}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => openReviewModal(record)}
                          className={`${styles.actionBtn} ${styles.edit}`}
                          title="Review Record"
                        >
                          <CheckCircle className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handlePrintSlip(record)}
                          className={`${styles.actionBtn}`}
                          title="Print Slip"
                        >
                          <Printer className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Premium Review Modal ── */}
      {reviewModalOpen && selectedRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Review Testing Record</h3>
                <p className={styles.modalSubtitle}>{selectedRecord.referenceNo} • {selectedRecord.productName}</p>
              </div>
              <button 
                onClick={() => setReviewModalOpen(false)}
                className={styles.modalClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className={styles.modalBody}>
              <div>
                <label className={styles.modalLabel}>Update Status Decision</label>
                <div className={styles.statusGrid}>
                  <div
                    onClick={() => setReviewStatus('Approved')}
                    className={`${styles.statusOption} ${reviewStatus === 'Approved' ? styles.approved : ''}`}
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span>Approve</span>
                  </div>
                  
                  <div
                    onClick={() => setReviewStatus('Rejected')}
                    className={`${styles.statusOption} ${reviewStatus === 'Rejected' ? styles.rejected : ''}`}
                  >
                    <XCircle className="w-6 h-6" />
                    <span>Reject</span>
                  </div>
                  
                  <div
                    onClick={() => setReviewStatus('Needs Retest')}
                    className={`${styles.statusOption} ${reviewStatus === 'Needs Retest' ? styles.retest : ''}`}
                  >
                    <AlertCircle className="w-6 h-6" />
                    <span>Retest</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className={styles.modalLabel}>Remarks / Notes</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className={styles.modalTextarea}
                  rows="3"
                  placeholder="Provide details about the decision..."
                />
              </div>
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.modalBtn} ${styles.modalBtnSubmit}`}
                >
                  <Check className="w-4 h-4" />
                  Confirm {reviewStatus ? reviewStatus : 'Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

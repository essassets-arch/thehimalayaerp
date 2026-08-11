'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Printer, 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  X, 
  Clock, 
  RotateCcw,
  FileCheck2,
  AlertTriangle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
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
  const [submitting, setSubmitting] = useState(false);

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
      toast.error('Please select an audit status decision');
      return;
    }
    if (!selectedRecord) return;

    try {
      setSubmitting(true);
      await backendFetch(`/api/backend/production/testing/${selectedRecord.id}/status`, {
        method: 'PATCH',
        body: {
          status: reviewStatus,
          remarks: remarks.trim() || undefined,
        },
      });

      toast.success(`Record #${selectedRecord.referenceNo} set to ${reviewStatus}`);
      setReviewModalOpen(false);
      fetchRecords(false);
    } catch (err: any) {
      toast.error(err?.message || 'Error submitting audit review');
    } finally {
      setSubmitting(false);
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
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quality Audit Slip - ${record.referenceNo}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
            .slip-card { border: 2px solid #2F4375; border-radius: 16px; max-width: 500px; margin: 0 auto; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
            .header { background: #2F4375; color: #fff; padding: 24px; text-align: center; }
            .header h2 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
            .header p { margin: 0; color: #93c5fd; font-size: 13px; font-weight: 500; }
            .body { padding: 24px; }
            .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; }
            .value { font-weight: 600; color: #0f172a; }
            .status { font-weight: 700; text-transform: uppercase; padding: 5px 12px; border-radius: 9999px; font-size: 11px; letter-spacing: 0.05em; display: inline-block; }
            .status.approved { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
            .status.rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
            .status.retest { background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }
            .status.pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header">
              <h2>HIMALAYA ENTERPRISE</h2>
              <p>Quality Testing Audit Verification</p>
            </div>
            <div class="body">
              <div class="row"><span class="label">Reference No:</span> <span class="value" style="font-family: monospace; color: #2F4375;">${record.referenceNo}</span></div>
              <div class="row"><span class="label">Product / Material:</span> <span class="value">${record.productName}</span></div>
              <div class="row"><span class="label">Quantity:</span> <span class="value">${Number(record.quantity).toLocaleString()} PCS</span></div>
              <div class="row"><span class="label">Audit Status:</span> <span class="status ${record.status.toLowerCase().replace('needs ', '')}">${record.status}</span></div>
              ${record.reviewedBy ? `<div class="row"><span class="label">Reviewed By:</span> <span class="value">${record.reviewedBy}</span></div>` : ''}
              ${record.remarks ? `<div class="row"><span class="label">Audit Remarks:</span> <span class="value">${record.remarks}</span></div>` : ''}
              <div class="row"><span class="label">Timestamp:</span> <span class="value">${new Date(record.createdAt).toLocaleString()}</span></div>
            </div>
            <div class="footer">Official Quality Sign-off Log • Himalaya ERP System</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Metrics calculation
  const totalCount = records.length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const approvedCount = records.filter(r => r.status === 'Approved').length;
  const retestCount = records.filter(r => r.status === 'Needs Retest' || r.status === 'Rejected').length;

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.referenceNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reviewedBy || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className={`${styles.badge} ${styles.badgeApproved}`}>
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className={`${styles.badge} ${styles.badgeRejected}`}>
            <XCircle size={13} /> Rejected
          </span>
        );
      case 'Needs Retest':
        return (
          <span className={`${styles.badge} ${styles.badgeRetest}`}>
            <RotateCcw size={13} /> Needs Retest
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <Clock size={13} /> Pending Sign-off
          </span>
        );
    }
  };

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.titleRow}>
            <div className={styles.iconWrapper}>
              <FileCheck2 size={24} className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>Plant Head — Production Quality Audit</h1>
              <p className={styles.subtitle}>Review and sign off quality testing logs submitted by the production floor.</p>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshBtn} 
            onClick={() => fetchRecords(true)} 
            disabled={loading}
            title="Refresh testing logs"
          >
            <RefreshCw size={15} className={loading ? styles.spinning : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className={styles.statsGrid}>
        <div 
          className={`${styles.statCard} ${statusFilter === 'All' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          <div className={styles.statIconWrap} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Database size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Audits</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
        </div>

        <div 
          className={`${styles.statCard} ${statusFilter === 'Pending' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('Pending')}
        >
          <div className={styles.statIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Sign-offs</span>
            <span className={styles.statValue} style={{ color: '#d97706' }}>{pendingCount}</span>
          </div>
          {pendingCount > 0 && <span className={styles.pulseDot} />}
        </div>

        <div 
          className={`${styles.statCard} ${statusFilter === 'Approved' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('Approved')}
        >
          <div className={styles.statIconWrap} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Approved</span>
            <span className={styles.statValue} style={{ color: '#16a34a' }}>{approvedCount}</span>
          </div>
        </div>

        <div 
          className={`${styles.statCard} ${statusFilter === 'Needs Retest' || statusFilter === 'Rejected' ? styles.statCardActive : ''}`}
          onClick={() => setStatusFilter('Needs Retest')}
        >
          <div className={styles.statIconWrap} style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Retest / Rejected</span>
            <span className={styles.statValue} style={{ color: '#dc2626' }}>{retestCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={styles.tableCard}>
        {/* Controls / Filter Bar */}
        <div className={styles.tableToolbar}>
          {/* Status Tabs */}
          <div className={styles.statusTabs}>
            {[
              { id: 'All', label: 'All Logs', count: totalCount },
              { id: 'Pending', label: 'Pending', count: pendingCount },
              { id: 'Approved', label: 'Approved', count: approvedCount },
              { id: 'Needs Retest', label: 'Retest', count: records.filter(r => r.status === 'Needs Retest').length },
              { id: 'Rejected', label: 'Rejected', count: records.filter(r => r.status === 'Rejected').length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabBtn} ${statusFilter === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className={styles.tabBadge}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search ref no, product or reviewer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button 
                type="button" 
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p className={styles.stateTitle}>Loading Quality Testing Logs...</p>
            <p className={styles.stateHint}>Fetching latest floor submissions</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>
              <Database size={28} />
            </div>
            <p className={styles.stateTitle}>No Quality Testing Logs Found</p>
            <p className={styles.stateHint}>
              {searchQuery || statusFilter !== 'All' 
                ? 'No matching logs found for your search or filter options.'
                : 'There are currently no quality testing records logged.'}
            </p>
            {(searchQuery || statusFilter !== 'All') && (
              <button 
                className={styles.resetFilterBtn}
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead className={styles.thead}>
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
                <tbody className={styles.tbody}>
                  {filteredRecords.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <code className={styles.refCode}>{r.referenceNo}</code>
                      </td>
                      <td>
                        <div className={styles.productCell}>
                          <span className={styles.productName}>{r.productName}</span>
                          {r.remarks && <span className={styles.remarksText}>{r.remarks}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.qtyText}>{Number(r.quantity).toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={styles.uomBadge}>PCS</span>
                      </td>
                      <td>
                        <span className={styles.dateText}>
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        {r.reviewedBy ? (
                          <div className={styles.reviewerBadge}>
                            <UserCheck size={13} />
                            <span>{r.reviewedBy}</span>
                          </div>
                        ) : (
                          <span className={styles.unreviewedText}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.actionIconBtn}
                            title="Print Testing Slip"
                            onClick={() => handlePrintSlip(r)}
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.reviewActionBtn} ${r.status === 'Pending' ? styles.reviewActionBtnPending : ''}`}
                            onClick={() => openReviewModal(r)}
                          >
                            <span>{r.status === 'Pending' ? 'Sign Off' : 'Review'}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (<768px) */}
            <div className={styles.mobileCardList}>
              {filteredRecords.map((r) => (
                <div key={r.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <code className={styles.refCode}>{r.referenceNo}</code>
                    {getStatusBadge(r.status)}
                  </div>

                  <div className={styles.mobileCardBody}>
                    <h3 className={styles.mobileProductName}>{r.productName}</h3>
                    
                    <div className={styles.mobileMetaGrid}>
                      <div className={styles.mobileMetaItem}>
                        <span className={styles.mobileMetaLabel}>Quantity:</span>
                        <span className={styles.mobileMetaVal}>{Number(r.quantity).toLocaleString()} PCS</span>
                      </div>
                      <div className={styles.mobileMetaItem}>
                        <span className={styles.mobileMetaLabel}>Date:</span>
                        <span className={styles.mobileMetaVal}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.reviewedBy && (
                        <div className={styles.mobileMetaItem} style={{ gridColumn: 'span 2' }}>
                          <span className={styles.mobileMetaLabel}>Reviewed By:</span>
                          <span className={styles.mobileMetaVal}>{r.reviewedBy}</span>
                        </div>
                      )}
                      {r.remarks && (
                        <div className={styles.mobileMetaItem} style={{ gridColumn: 'span 2' }}>
                          <span className={styles.mobileMetaLabel}>Remarks:</span>
                          <span className={styles.mobileMetaVal} style={{ fontWeight: 400, color: '#475569' }}>{r.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.mobileCardFooter}>
                    <button
                      type="button"
                      className={styles.mobilePrintBtn}
                      onClick={() => handlePrintSlip(r)}
                    >
                      <Printer size={14} />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      className={styles.mobileReviewBtn}
                      onClick={() => openReviewModal(r)}
                    >
                      <span>{r.status === 'Pending' ? 'Sign Off Audit' : 'Review Audit'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review Sign-Off Modal */}
      {reviewModalOpen && selectedRecord && (
        <div className={styles.modalOverlay} onClick={() => setReviewModalOpen(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Quality Audit Sign-Off</h3>
                <p className={styles.modalSubtitle}>Update audit status for reference <code className={styles.inlineCode}>{selectedRecord.referenceNo}</code></p>
              </div>
              <button 
                type="button"
                className={styles.modalClose} 
                onClick={() => setReviewModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className={styles.modalBody}>
                {/* Summary Info Banner */}
                <div className={styles.recordSummaryBox}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Product / Material</span>
                    <span className={styles.summaryVal}>{selectedRecord.productName}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Quantity</span>
                    <span className={styles.summaryVal}>{selectedRecord.quantity} PCS</span>
                  </div>
                </div>

                {/* Audit Decision Selector */}
                <div>
                  <label className={styles.modalLabel}>Audit Status Decision *</label>
                  <div className={styles.statusGrid}>
                    <button
                      type="button"
                      className={`${styles.statusOption} ${reviewStatus === 'Approved' ? styles.statusOptionApproved : ''}`}
                      onClick={() => setReviewStatus('Approved')}
                    >
                      <CheckCircle2 size={20} />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      className={`${styles.statusOption} ${reviewStatus === 'Needs Retest' ? styles.statusOptionRetest : ''}`}
                      onClick={() => setReviewStatus('Needs Retest')}
                    >
                      <RotateCcw size={20} />
                      <span>Needs Retest</span>
                    </button>

                    <button
                      type="button"
                      className={`${styles.statusOption} ${reviewStatus === 'Rejected' ? styles.statusOptionRejected : ''}`}
                      onClick={() => setReviewStatus('Rejected')}
                    >
                      <XCircle size={20} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Remarks Textarea */}
                <div>
                  <label className={styles.modalLabel}>Quality Audit Remarks / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter inspection feedback or instructions for production floor..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={styles.modalTextarea}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalBtnCancel}
                  onClick={() => setReviewModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.modalBtnSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Audit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

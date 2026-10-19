'use client';

import React, { useState } from 'react';
import { Download, Printer, CheckCircle, XCircle, RotateCcw, Edit2, X, Loader2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import TestCertificateDocument, { TestCertificateData } from './TestCertificateDocument';
import TestCertificateDocument2 from './TestCertificateDocument2';
import { downloadTestCertificatePdf } from '../utils/testCertificatePdf';
import { backendFetch } from '../../../lib/backendFetch';
import styles from './CertificatePreviewModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: TestCertificateData | null;
  onReportUpdated: (updatedReport: any) => void;
  onEdit: (report: TestCertificateData) => void;
  onDelete?: (report: TestCertificateData) => void;
}

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  report,
  onReportUpdated,
  onEdit,
  onDelete,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeReport, setActiveReport] = useState<TestCertificateData | null>(report);

  const isCert2Initial = React.useMemo(() => {
    if (!report) return false;
    if ((report as any).certificateType === 'CERT_2' || (report as any).certificateType === 'FRP_COVER_FRAME') return true;
    if (report.remarks && (report.remarks.includes('CERT_2') || report.remarks.includes('FRP_COVER_FRAME'))) return true;
    const specs = report.specifications || [];
    return specs.some((s) => {
      const n = (s.specification || '').toLowerCase();
      return n.includes('cover size') || n.includes('frame size');
    });
  }, [report]);

  const [activeTemplate, setActiveTemplate] = useState<'CERT_1' | 'CERT_2'>(
    isCert2Initial ? 'CERT_2' : 'CERT_1'
  );

  React.useEffect(() => {
    setActiveReport(report);
    if (report) {
      const isC2 =
        (report as any).certificateType === 'CERT_2' ||
        (report as any).certificateType === 'FRP_COVER_FRAME' ||
        (report.remarks && (report.remarks.includes('CERT_2') || report.remarks.includes('FRP_COVER_FRAME'))) ||
        (report.specifications || []).some((s) => {
          const n = (s.specification || '').toLowerCase();
          return n.includes('cover size') || n.includes('frame size');
        });
      setActiveTemplate(isC2 ? 'CERT_2' : 'CERT_1');
    }
  }, [report]);

  if (!isOpen || !activeReport) return null;

  const isApproved = activeReport.status === 'Approved';
  const isDraftOrPending = activeReport.status === 'Draft' || activeReport.status === 'Pending Approval';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const safeNumber = String(activeReport.reportNumber || activeReport.id || 'Report')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .trim();
      const customFilename = activeTemplate === 'CERT_2'
        ? `Himalaya-TDS-Technical-Data-Specification-${safeNumber}.pdf`
        : `Test-Certificate-${safeNumber}.pdf`;
      await downloadTestCertificatePdf(activeReport, 'test-certificate-document-preview', customFilename);
    } catch (e: any) {
      toast.error('Download failed: ' + e?.message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async () => {
    // Check if measurements are filled
    const rows = activeReport.loadTestingRows || [];
    const missingLoad = rows.some((r) => !r.load || String(r.load).trim() === '');
    if (missingLoad) {
      Swal.fire({
        icon: 'warning',
        title: 'Measurements Incomplete',
        text: 'All five load sequence stages must have recorded load values before approval.',
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Approve Test Certificate?',
      text: `Are you sure you want to approve ${activeReport.reportNumber}? Once approved, the certificate is revision-controlled.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve & Sign',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a',
    });

    if (!confirm.isConfirmed) return;

    setApproving(true);
    try {
      const res: any = await backendFetch(
        `/api/backend/production/testing/reports/${activeReport.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'Approved' },
        }
      );
      toast.success('Certificate approved and signed');
      const updated = res?.data || res;
      setActiveReport(updated);
      onReportUpdated(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve certificate');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Test Certificate',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter failure reasons (e.g. Deflection exceeded tolerance, cracks observed)...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Reject Certificate',
      inputValidator: (value) => {
        if (!value) return 'Please specify the rejection reason.';
        return null;
      },
    });

    if (!reason) return;

    setApproving(true);
    try {
      const res: any = await backendFetch(
        `/api/backend/production/testing/reports/${activeReport.id}/status`,
        {
          method: 'PATCH',
          body: { status: 'Rejected', rejectionReason: reason },
        }
      );
      toast.error('Certificate marked as Rejected');
      const updated = res?.data || res;
      setActiveReport(updated);
      onReportUpdated(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject certificate');
    } finally {
      setApproving(false);
    }
  };

  const handleRevise = async () => {
    const confirm = await Swal.fire({
      title: 'Create New Revision?',
      text: `This will create Revision ${(activeReport.revision || 0) + 1} of ${activeReport.reportNumber} in Draft status. The current approved revision will remain safely preserved.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Create Revision',
      confirmButtonColor: '#8b5cf6',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res: any = await backendFetch(
        `/api/backend/production/testing/reports/${activeReport.id}/revise`,
        { method: 'POST' }
      );
      toast.success('New revision created');
      const newRev = res?.data || res;
      setActiveReport(newRev);
      onReportUpdated(newRev);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create revision');
    }
  };

  const statusCls = {
    Approved: styles.statusApproved,
    'Pending Approval': styles.statusPending,
    Draft: styles.statusDraft,
    Rejected: styles.statusRejected,
  }[activeReport.status || 'Draft'] || styles.statusDraft;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarTitle}>
            <span>{activeReport.reportNumber}</span>
            <span className={`${styles.statusBadge} ${statusCls}`}>{activeReport.status}</span>
            {activeReport.revision !== undefined && (
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Rev {activeReport.revision}</span>
            )}
          </div>

          <div className={styles.toolbarActions}>
            <button
              className={`${styles.actionBtn} ${styles.btnDownload}`}
              onClick={handleDownload}
              disabled={downloading}
              title="Download Genuine PDF"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download PDF
            </button>

            <button
              className={`${styles.actionBtn} ${styles.btnPrint}`}
              onClick={handlePrint}
              title="Print Certificate"
            >
              <Printer size={14} />
              Print
            </button>

            {isDraftOrPending && (
              <>
                <button
                  className={`${styles.actionBtn} ${styles.btnApprove}`}
                  onClick={handleApprove}
                  disabled={approving}
                  title="Approve and apply digital seal"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.btnReject}`}
                  onClick={handleReject}
                  disabled={approving}
                  title="Reject Certificate"
                >
                  <XCircle size={14} />
                  Reject
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.btnPrint}`}
                  onClick={() => {
                    onClose();
                    onEdit(activeReport);
                  }}
                  title="Edit Certificate"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
              </>
            )}

            {isApproved && (
              <button
                className={`${styles.actionBtn} ${styles.btnRevise}`}
                onClick={handleRevise}
                title="Create a new revision for this certificate"
              >
                <RotateCcw size={14} />
                Create Revision
              </button>
            )}

            {onDelete && activeReport && (
              <button
                className={styles.actionBtn}
                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                onClick={() => {
                  onClose();
                  onDelete(activeReport);
                }}
                title="Delete Certificate"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}

            <button className={styles.btnClose} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Template Selection Bar */}
        <div className={styles.templateBar}>
          <span className={styles.templateBarLabel}>Document Template:</span>
          <button
            type="button"
            className={`${styles.templateTab} ${activeTemplate === 'CERT_1' ? styles.templateTabActive : ''}`}
            onClick={() => setActiveTemplate('CERT_1')}
          >
            <span>📜</span>
            <span>Certificate 1: MTC (Proof Load &amp; Full Specs)</span>
          </button>
          <button
            type="button"
            className={`${styles.templateTab} ${activeTemplate === 'CERT_2' ? styles.templateTabActive : ''}`}
            onClick={() => setActiveTemplate('CERT_2')}
          >
            <span>📄</span>
            <span>Certificate 2: TDS — Technical Data Specification</span>
          </button>
        </div>

        {/* Scrollable Certificate View */}
        <div className={styles.previewScrollArea}>
          <div className={styles.sheetShadow}>
            {activeTemplate === 'CERT_2' ? (
              <TestCertificateDocument2
                report={activeReport}
                id="test-certificate-document-preview"
              />
            ) : (
              <TestCertificateDocument
                report={activeReport}
                id="test-certificate-document-preview"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

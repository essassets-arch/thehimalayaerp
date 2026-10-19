'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Printer, Search, Download, FileText,
  CheckCircle, XCircle, AlertCircle, ClipboardList, X, Loader2,
  Eye, RotateCcw, RefreshCw, ShieldCheck, FileCheck2, Clock, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { backendFetch } from '@/lib/backendFetch';
import { safeSaveFile } from '@/services/export.service';
import TestCertificateDocument, { TestCertificateData } from '@/modules/production/components/TestCertificateDocument';
import TestCertificateDocument2 from '@/modules/production/components/TestCertificateDocument2';
import TestReportFormModal from '@/modules/production/components/TestReportFormModal';
import CertificatePreviewModal from '@/modules/production/components/CertificatePreviewModal';
import { downloadTestCertificatePdf } from '@/modules/production/utils/testCertificatePdf';
import styles from './testing.module.css';

export default function ProductionTestingPage() {
  const queryClient = useQueryClient();

  /* ── Tab Switcher State ('reports' vs 'log') ── */
  const [activeTab, setActiveTab] = useState<'reports' | 'log'>('reports');

  /* ══════════════════════════════════════════════════════════════════
     TESTING REPORTS & CERTIFICATES STATE
     ══════════════════════════════════════════════════════════════════ */
  const [reports, setReports] = useState<TestCertificateData[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL');
  const [reportTemplateFilter, setReportTemplateFilter] = useState<'ALL' | 'CERT_1' | 'CERT_2'>('ALL');

  // Modals for Testing Reports
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<TestCertificateData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<TestCertificateData | null>(null);

  // Hidden container for direct register row PDF download
  const [directDownloadReport, setDirectDownloadReport] = useState<TestCertificateData | null>(null);
  const [rowDownloadingId, setRowDownloadingId] = useState<string | null>(null);

  // Shared master data
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [productError, setProductError] = useState('');

  /* ══════════════════════════════════════════════════════════════════
     EXISTING QUALITY TESTING LOG (STOCK DEDUCTION) STATE
     ══════════════════════════════════════════════════════════════════ */
  const submitting = useRef(false);
  const pendingRequest = useRef<{ fingerprint: string; id: string } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ productId: '', productName: '', quantity: '', remarks: '' });
  const [editingId, setEditingId] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  /* ── Load Products Master for Dropdown ── */
  const fetchProducts = async () => {
    try {
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/products?scope=catalog&limit=5000', { cacheTtlMs: 0 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
      setProductError('');
    } catch {
      setProductError('Unable to load products. Please retry.');
    }
  };

  /* ── Load Customers for Autocomplete ── */
  const fetchCustomers = async () => {
    try {
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/sales/customers?page=1&pageSize=1000', { cacheTtlMs: 0 });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setCustomers(list);
    } catch {
      // Optional fallback
    }
  };

  /* ── Fetch Testing Reports from PostgreSQL via Backend ── */
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError(null);
      const params = new URLSearchParams();
      if (reportStatusFilter !== 'ALL') params.append('status', reportStatusFilter);
      if (reportSearch.trim()) params.append('search', reportSearch.trim());

      const url = `/api/backend/production/testing/reports${params.toString() ? `?${params.toString()}` : ''}`;
      const res: any = await backendFetch(url, { cacheTtlMs: 0 });
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setReports(list);
    } catch (err: any) {
      console.error('[fetchReports error]:', err);
      setReportsError(err?.message || 'Unable to load test certificates.');
      toast.error('Unable to load test certificates from backend');
    } finally {
      setReportsLoading(false);
    }
  };

  /* ── Load Testing Log Records (Stock Deduction) ── */
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/production/testing', { cacheTtlMs: 0 });
      const dataList = Array.isArray(res) ? res : (res?.data || []);
      setRecords(dataList);
    } catch (err: any) {
      setError(err?.message || 'Unable to load testing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchReports();
    fetchRecords();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [reportStatusFilter]);

  /* ── Check if Report is Certificate 2 (TDS / Specification Sheet) ── */
  const isCert2Report = (report: TestCertificateData | null | undefined): boolean => {
    if (!report) return false;
    if ((report as any).certificateType === 'CERT_2' || (report as any).certificateType === 'TDS' || (report as any).certificateType === 'FRP_COVER_FRAME') return true;
    if (report.remarks && (report.remarks.includes('CERT_2') || report.remarks.includes('TDS') || report.remarks.includes('FRP_COVER_FRAME'))) return true;
    const specs = report.specifications || [];
    return specs.some((s) => {
      const n = (s.specification || '').toLowerCase();
      return n.includes('cover size') || n.includes('frame size');
    });
  };

  /* ── KPI Summary Calculations ── */
  const metrics = useMemo(() => {
    const total = reports.length;
    const approved = reports.filter((r) => r.status === 'Approved').length;
    const pending = reports.filter((r) => r.status === 'Pending Approval' || r.status === 'Draft').length;
    const cert2Count = reports.filter((r) => isCert2Report(r)).length;
    const cert1Count = total - cert2Count;
    const totalDeductedStock = records.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);

    return {
      total,
      approved,
      pending,
      cert2Count,
      cert1Count,
      totalDeductedStock,
      totalLogs: records.length,
    };
  }, [reports, records]);

  /* ── Direct PDF Download from Register Row ── */
  const handleDownloadRowPdf = async (report: TestCertificateData) => {
    setRowDownloadingId(report.id || report.reportNumber);
    setDirectDownloadReport(report);

    // Wait for the hidden certificate document to mount in the DOM
    setTimeout(async () => {
      try {
        const isC2 = isCert2Report(report);
        const safeNumber = String(report.reportNumber || report.id || 'Report')
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, '_')
          .trim();
        const customFilename = isC2
          ? `Himalaya-TDS-Technical-Data-Specification-${safeNumber}.pdf`
          : `Test-Certificate-${safeNumber}.pdf`;

        await downloadTestCertificatePdf(report, 'hidden-direct-download-cert', customFilename);
      } catch (err: any) {
        toast.error('Failed to download PDF: ' + err?.message);
      } finally {
        setRowDownloadingId(null);
      }
    }, 150);
  };

  /* ── Delete Report ── */
  const handleDeleteReport = async (report: TestCertificateData) => {
    const confirm = await Swal.fire({
      title: 'Delete Certificate?',
      text: `Are you sure you want to delete certificate ${report.reportNumber}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      const targetId = report.id || report.reportNumber;
      await backendFetch(`/api/backend/production/testing/reports/${targetId}`, { method: 'DELETE' });
      toast.success('Certificate deleted successfully');
      fetchReports();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete certificate');
    }
  };

  /* ── Quick Approve from Register ── */
  const handleQuickApprove = async (report: TestCertificateData) => {
    const isC2 = isCert2Report(report);
    if (!isC2) {
      const rows = report.loadTestingRows || [];
      const missingLoad = rows.some((r) => !r.load || String(r.load).trim() === '');
      if (missingLoad) {
        Swal.fire({
          icon: 'warning',
          title: 'Measurements Incomplete',
          text: 'All five load sequence stages must have recorded load values before approval. Please edit the report first.',
        });
        return;
      }
    }

    const confirm = await Swal.fire({
      title: 'Approve Certificate?',
      text: `Approve and apply official signature & seal to ${report.reportNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve & Sign',
      confirmButtonColor: '#16a34a',
    });

    if (!confirm.isConfirmed) return;

    try {
      await backendFetch(`/api/backend/production/testing/reports/${report.id}/status`, {
        method: 'PATCH',
        body: { status: 'Approved' },
      });
      toast.success('Certificate approved and digitally signed');
      fetchReports();
    } catch (err: any) {
      toast.error(err?.message || 'Approval failed');
    }
  };

  /* ── Quick Revise from Register ── */
  const handleQuickRevise = async (report: TestCertificateData) => {
    const confirm = await Swal.fire({
      title: 'Create Revision?',
      text: `Create Revision ${(report.revision || 0) + 1} of ${report.reportNumber}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Create Revision',
      confirmButtonColor: '#8b5cf6',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res: any = await backendFetch(`/api/backend/production/testing/reports/${report.id}/revise`, {
        method: 'POST',
      });
      toast.success('New revision created');
      fetchReports();
      const newRev = res?.data || res;
      setEditingReport(newRev);
      setIsFormOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create revision');
    }
  };

  /* ── Export Reports Register to Excel ── */
  const exportReportsToExcel = () => {
    const wsData = reports.map((r) => ({
      'Certificate No': r.reportNumber,
      'Revision': r.revision ?? 0,
      'Type': isCert2Report(r) ? 'TDS Technical Specification' : 'MTC Proof Load',
      'Date': r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-GB') : '',
      'Client Name': r.clientName,
      'P.O. No': r.poNumber || '',
      'Product Name': r.productName,
      'Clear Opening': r.clearOpening || '',
      'Capacity Rating': r.finalLoadTon ? `${r.finalLoadTon} Ton` : r.cycleLoadsTon ? `${r.cycleLoadsTon} Ton` : '',
      'Status': r.status,
      'Tested By': r.testedByName || 'R&D Quality Engineer',
      'Approved By': r.approvedByName || '',
      'Approved Date': r.approvedAt ? new Date(r.approvedAt).toLocaleDateString('en-GB') : '',
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Certificates');
    XLSX.writeFile(wb, `test_certificates_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /* ══════════════════════════════════════════════════════════════════
     EXISTING LOG REGISTER HANDLERS
     ══════════════════════════════════════════════════════════════════ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!editingId && !products.some(p => p.id === formData.productId)) {
      toast.error('Select a product from the product master');
      return;
    }
    const qtyNum = Number(formData.quantity);
    if (!Number.isSafeInteger(qtyNum) || qtyNum <= 0) {
      toast.error('Quantity must be a positive whole number');
      return;
    }
    const payload = editingId ? { remarks: formData.remarks.trim() } : {
      productId: formData.productId, quantity: qtyNum, remarks: formData.remarks.trim(),
    };
    const fingerprint = JSON.stringify(payload);
    if (!pendingRequest.current || pendingRequest.current.fingerprint !== fingerprint) {
      pendingRequest.current = { fingerprint, id: crypto.randomUUID() };
    }
    submitting.current = true;
    setIsSubmitting(true);
    try {
      await backendFetch(editingId ? '/api/backend/production/testing/' + editingId : '/api/backend/production/testing', {
        method: editingId ? 'PUT' : 'POST',
        body: editingId ? payload : { ...payload, requestId: pendingRequest.current.id },
      });
      pendingRequest.current = null;
      setFormData({ productId: '', productName: '', quantity: '', remarks: '' });
      setEditingId(null);
      setProductSearch('');
      setShowForm(false);
      await Promise.all([
        fetchRecords(),
        queryClient.invalidateQueries({ queryKey: ['finished-goods-all-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['finished-goods-all-stock-logs'] }),
      ]);
      await Swal.fire({
        icon: 'success',
        title: editingId ? 'Testing notes updated' : 'Testing record added successfully',
        text: editingId ? undefined : qtyNum + ' PCS deducted from stock.'
      });
    } catch (err: any) {
      toast.error(err?.message || 'Unable to confirm submission. Retry safely.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (recordOrId: any) => {
    const record = typeof recordOrId === 'object' ? recordOrId : records.find(r => r.id === recordOrId);
    const id = typeof recordOrId === 'object' ? recordOrId.id : recordOrId;
    const ref = record?.referenceNo || record?.productName || id;

    const confirm = await Swal.fire({
      title: 'Delete Testing Record?',
      text: `Are you sure you want to delete testing record "${ref}"? Any deducted stock will be restored to inventory.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      await backendFetch(`/api/backend/production/testing/${id}`, { method: 'DELETE' });
      toast.success('Testing record deleted successfully');
      await Promise.all([
        fetchRecords(),
        queryClient.invalidateQueries({ queryKey: ['finished-goods-all-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['finished-goods-all-stock-logs'] }),
      ]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete record');
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setFormData({
      productId: record.productId || '',
      productName: record.productName,
      quantity: String(record.quantity),
      remarks: record.remarks || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setFormData({ productId: '', productName: '', quantity: '', remarks: '' });
    setShowForm(false);
  };

  const handlePrintSlip = (record: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Slip – ${record.referenceNo}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111827; }
        .card { border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; max-width: 480px; margin: 0 auto; }
        .hd { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px; }
        h2 { margin: 0 0 4px; font-size: 22px; color: #1e293b; } p { margin: 0; color: #64748b; font-size: 13px; }
        .row { display: flex; justify-content: space-between; margin: 10px 0; padding-bottom: 8px; border-bottom: 1px dashed #e5e7eb; }
        .row:last-of-type { border-bottom: none; } .lbl { font-weight: 600; color: #475569; }
        .badge { padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .Pending { background:#fef9c3; color:#854d0e; } .Approved { background:#dcfce7; color:#166534; }
        .Rejected { background:#fee2e2; color:#991b1b; } .footer { margin-top: 28px; text-align:center; font-size:11px; color:#94a3b8; }
      </style></head><body>
      <div class="card">
        <div class="hd"><h2>Quality Testing Slip</h2><p>Himalaya Wellness Company</p></div>
        <div class="row"><span class="lbl">Reference:</span><span>${record.referenceNo}</span></div>
        <div class="row"><span class="lbl">Product:</span><span>${record.productName}</span></div>
        <div class="row"><span class="lbl">Quantity:</span><span>${record.quantity} PCS</span></div>
        <div class="row"><span class="lbl">Status:</span><span class="badge ${record.status.replace(' ','')}">${record.status}</span></div>
        ${record.remarks ? `<div class="row"><span class="lbl">Remarks:</span><span>${record.remarks}</span></div>` : ''}
        ${record.reviewedBy ? `<div class="row"><span class="lbl">Reviewed By:</span><span>${record.reviewedBy}</span></div>` : ''}
        <div class="row"><span class="lbl">Created:</span><span>${new Date(record.createdAt).toLocaleString()}</span></div>
        <div class="footer">Generated by Himalaya ERP System</div>
      </div>
      <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  const exportToExcel = () => {
    const wsData = records.map(r => ({
      'Reference No': r.referenceNo,
      'Product Name': r.productName,
      'Quantity': Number(r.quantity),
      'UOM': 'PCS',
      'Status': r.status,
      'Remarks': r.remarks || '',
      'Reviewed By': r.reviewedBy || '',
      'Date Created': new Date(r.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Testing Records');
    XLSX.writeFile(wb, `testing_log_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    doc.text('Production Testing Log Register', 14, 15);
    autoTable(doc, {
      head: [['Reference', 'Product Name', 'Qty', 'UOM', 'Status', 'Remarks', 'Date']],
      body: records.map(r => [
        r.referenceNo,
        r.productName,
        Number(r.quantity),
        'PCS',
        r.status,
        r.remarks || '-',
        new Date(r.createdAt).toLocaleDateString(),
      ]),
      startY: 20,
    });
    await safeSaveFile(doc, `testing_log_${new Date().toISOString().split('T')[0]}.pdf`, 'application/pdf');
  };

  const filteredLogRecords = records.filter(r =>
    (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.referenceNo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = reports.filter(r => {
    if (reportStatusFilter !== 'ALL' && r.status !== reportStatusFilter) return false;
    if (reportTemplateFilter === 'CERT_1' && isCert2Report(r)) return false;
    if (reportTemplateFilter === 'CERT_2' && !isCert2Report(r)) return false;

    if (!reportSearch.trim()) return true;
    const term = reportSearch.toLowerCase();
    return (
      (r.reportNumber || '').toLowerCase().includes(term) ||
      (r.clientName || '').toLowerCase().includes(term) ||
      (r.productName || '').toLowerCase().includes(term) ||
      (r.poNumber || '').toLowerCase().includes(term) ||
      (r.projectName || '').toLowerCase().includes(term) ||
      (r.clearOpening || '').toLowerCase().includes(term)
    );
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const map = {
      'Approved':     [styles.badgeApproved,  <CheckCircle  key="i" size={11} />, 'Approved'],
      'Rejected':     [styles.badgeRejected,  <XCircle      key="i" size={11} />, 'Rejected'],
      'Needs Retest': [styles.badgeRetest,    <AlertCircle  key="i" size={11} />, 'Needs Retest'],
      'Pending Approval': [styles.badgePending, <Clock key="i" size={11} />, 'Pending Approval'],
      'Draft':        [styles.badgePending,   <Clock key="i" size={11} />, 'Draft'],
    };
    const [cls, icon, label] = (map as Record<string, any>)[status] ?? [styles.badgePending, <Clock key="i" size={11} />, status || 'Pending'];
    return (
      <span className={`${styles.badge} ${cls}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.contentWrapper}>
        {/* ── Hero Container ── */}
        <section className={styles.heroContainer}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />

          <div className={styles.heroTopRow}>
            <div className={styles.heroTitleSection}>
              <div className={styles.heroBadge}>
                <ShieldCheck size={13} />
                <span>Quality Assurance &amp; Testing Management · ISO / EN 124 Compliant</span>
              </div>
              <h1 className={styles.heroTitle}>Production Testing &amp; Quality Certification</h1>
              <p className={styles.heroSubtitle}>
                Issue certified Test Certificates (TDS Technical Specification Sheets &amp; MTC Proof Load Certificates), track sequential pressure test cycles, and manage destructive physical sample stock deductions.
              </p>
            </div>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.btnActionLight}
                onClick={() => {
                  fetchReports();
                  fetchRecords();
                }}
                title="Refresh Live Data"
              >
                <RefreshCw size={14} className={reportsLoading || loading ? 'animate-spin' : ''} />
                <span>Refresh Feed</span>
              </button>

              <button
                type="button"
                className={styles.btnActionGreen}
                onClick={activeTab === 'reports' ? exportReportsToExcel : exportToExcel}
                title="Export Excel Register"
              >
                <Download size={14} />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                className={styles.btnActionPrimary}
                onClick={() => {
                  if (activeTab === 'reports') {
                    setEditingReport(null);
                    setIsFormOpen(true);
                  } else {
                    fetchProducts();
                    setProductSearch('');
                    setShowForm(true);
                    setEditingId(null);
                    setFormData({ productId: '', productName: '', quantity: '', remarks: '' });
                  }
                }}
              >
                <Plus size={15} />
                <span>{activeTab === 'reports' ? 'New Test Certificate' : 'Add Test Record'}</span>
              </button>
            </div>
          </div>

          {/* ── KPI Metrics Grid ── */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIconBox} ${styles.kpiIconBlue}`}>
                <FileCheck2 size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{metrics.total}</div>
                <div className={styles.kpiLabel}>Total Certificates Issued</div>
                <div className={styles.kpiSubtext}>
                  {metrics.cert2Count} TDS Specs · {metrics.cert1Count} MTC Reports
                </div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIconBox} ${styles.kpiIconGreen}`}>
                <CheckCircle size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{metrics.approved}</div>
                <div className={styles.kpiLabel}>Approved &amp; Digitally Signed</div>
                <div className={styles.kpiSubtext}>Official sealed QA documents</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIconBox} ${styles.kpiIconAmber}`}>
                <Clock size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{metrics.pending}</div>
                <div className={styles.kpiLabel}>Pending QA / In Inspection</div>
                <div className={styles.kpiSubtext}>Drafts &amp; awaiting approval</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIconBox} ${styles.kpiIconPurple}`}>
                <ClipboardList size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{metrics.totalDeductedStock.toLocaleString()} PCS</div>
                <div className={styles.kpiLabel}>Physical Stock Deducted</div>
                <div className={styles.kpiSubtext}>Across {metrics.totalLogs} destructive test logs</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Top Segmented Tabs Navigation ── */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'reports' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={16} />
            <span>Test Reports &amp; Certificates</span>
            {reports.length > 0 && <span className={styles.tabBadge}>{reports.length}</span>}
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'log' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('log')}
          >
            <ClipboardList size={16} />
            <span>Testing Log (Stock Deductions)</span>
            {records.length > 0 && <span className={styles.tabBadge}>{records.length}</span>}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
           TAB 1: TESTING REPORTS & CERTIFICATES (PRIMARY MODULE)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className={styles.tableCard}>
            {/* Toolbar */}
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <FileText size={16} color="#0284c7" />
                <span className={styles.tableTitleText}>Certificate Register</span>
                {!reportsLoading && <span className={styles.countBadge}>{filteredReports.length}</span>}
              </div>

              <div className={styles.filterGroup}>
                {/* Template Filter (TDS Specification vs MTC Proof Load) */}
                <select
                  value={reportTemplateFilter}
                  onChange={(e) => setReportTemplateFilter(e.target.value as any)}
                  className={styles.selectFilter}
                  aria-label="Filter by Document Template"
                >
                  <option value="ALL">All Document Types</option>
                  <option value="CERT_2">TDS — Technical Data Specs</option>
                  <option value="CERT_1">MTC — Mill Test &amp; Proof Load</option>
                </select>

                {/* Status Filter */}
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className={styles.selectFilter}
                  aria-label="Filter by Status"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Draft">Draft</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Search */}
                <div className={styles.searchWrap}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search certificate, client, product, PO…"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <button
                  type="button"
                  className={styles.btnActionPrimary}
                  style={{ minHeight: '38px', padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => {
                    setEditingReport(null);
                    setIsFormOpen(true);
                  }}
                >
                  <Plus size={14} />
                  <span>New Certificate</span>
                </button>
              </div>
            </div>

            {/* States */}
            {reportsLoading ? (
              <div className={styles.stateBox}>
                <div className={styles.spinner} />
                <p className={styles.stateTitle}>Loading test certificates…</p>
                <span className={styles.stateHint}>Fetching ISO / EN 124 compliant records from database</span>
              </div>
            ) : reportsError ? (
              <div className={styles.stateBox}>
                <div className={styles.stateIcon}><AlertCircle size={28} color="#ef4444" /></div>
                <p className={styles.stateTitle} style={{ color: '#ef4444' }}>Unable to load test certificates</p>
                <p className={styles.stateHint}>{reportsError}</p>
                <button
                  onClick={fetchReports}
                  className={styles.btnActionPrimary}
                  style={{ marginTop: '8px', padding: '7px 16px', fontSize: '12.5px' }}
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className={styles.stateBox}>
                <div className={styles.stateIcon}><FileText size={28} /></div>
                <p className={styles.stateTitle}>
                  {reportSearch || reportStatusFilter !== 'ALL' || reportTemplateFilter !== 'ALL'
                    ? 'No certificates match your search filters'
                    : 'No test certificates generated yet'}
                </p>
                <p className={styles.stateHint}>
                  {reportSearch || reportStatusFilter !== 'ALL' || reportTemplateFilter !== 'ALL'
                    ? 'Try adjusting your search terms or clearing status and document type filters.'
                    : 'Click "New Certificate" above to generate your first technical specification sheet or proof load test certificate.'}
                </p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th>Certificate No. &amp; Type</th>
                      <th>Date</th>
                      <th>Client Name &amp; PO</th>
                      <th>Product &amp; Clear Opening</th>
                      <th>Capacity Rating</th>
                      <th>Status</th>
                      <th>Signatory</th>
                      <th style={{ textAlign: 'right', minWidth: '190px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tbody}>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <code className={styles.refCode}>{report.reportNumber}</code>
                            {report.revision !== undefined && (
                              <span className={styles.revBadge}>Rev {report.revision}</span>
                            )}
                            {isCert2Report(report) ? (
                              <span className={styles.cert2Badge} title="Certificate 2: TDS - Technical Data Specification">
                                <FileText size={10} /> TDS Spec
                              </span>
                            ) : (
                              <span className={styles.cert1Badge} title="Certificate 1: MTC & Proof Load">
                                <Layers size={10} /> MTC Proof
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className={styles.clientCell}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{report.clientName}</div>
                          {report.poNumber && (
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                              PO: <span style={{ fontWeight: 600, color: '#475569' }}>{report.poNumber}</span>
                            </div>
                          )}
                          {report.projectName && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                              {report.projectName}
                            </div>
                          )}
                        </td>
                        <td className={styles.productCell}>
                          <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{report.productName}</div>
                          {report.clearOpening && (
                            <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                              Opening: {report.clearOpening}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={styles.capacityBadge}>
                            {report.finalLoadTon
                              ? `${report.finalLoadTon} Ton`
                              : report.cycleLoadsTon
                              ? `${report.cycleLoadsTon} Ton`
                              : isCert2Report(report)
                              ? '12.5T (B125)'
                              : '-'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={report.status || 'Draft'} />
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          <div>Tested: <span style={{ fontWeight: 600, color: '#334155' }}>{report.testedByName || (isCert2Report(report) ? 'R&D Quality Engineer' : 'Sana Konda Reddy')}</span></div>
                          {report.approvedByName && (
                            <div style={{ color: '#166534', fontWeight: 700, marginTop: '2px' }}>
                              ✓ Appr: {report.approvedByName}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actions}>
                            {/* Visible Download PDF Button right on the register row */}
                            <button
                              className={styles.btnRowPdf}
                              onClick={() => handleDownloadRowPdf(report)}
                              disabled={rowDownloadingId === (report.id || report.reportNumber)}
                              title="Download Genuine A4 PDF"
                            >
                              {rowDownloadingId === (report.id || report.reportNumber) ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Download size={13} />
                              )}
                              <span>PDF</span>
                            </button>

                            {/* Preview / View Action */}
                            <button
                              className={styles.actionBtn}
                              title="Preview / Print Certificate"
                              onClick={() => {
                                setPreviewReport(report);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Eye size={14} color="#0284c7" />
                            </button>

                            {/* Approve Action (if not approved) */}
                            {report.status !== 'Approved' && (
                              <button
                                className={styles.actionBtn}
                                title="Approve & Sign Certificate"
                                onClick={() => handleQuickApprove(report)}
                              >
                                <CheckCircle size={14} color="#16a34a" />
                              </button>
                            )}

                            {/* Create Revision (if approved) */}
                            {report.status === 'Approved' && (
                              <button
                                className={styles.actionBtn}
                                title="Create Revision"
                                onClick={() => handleQuickRevise(report)}
                              >
                                <RotateCcw size={14} color="#8b5cf6" />
                              </button>
                            )}

                            {/* Edit Action (if draft or pending) */}
                            {report.status !== 'Approved' && (
                              <button
                                className={`${styles.actionBtn} ${styles.edit}`}
                                title="Edit Certificate"
                                onClick={() => {
                                  setEditingReport(report);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit2 size={14} />
                              </button>
                            )}

                            <button
                              className={`${styles.actionBtn} ${styles.del}`}
                              title="Delete Certificate"
                              onClick={() => handleDeleteReport(report)}
                            >
                              <Trash2 size={14} />
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
        )}

        {/* ══════════════════════════════════════════════════════════════════
           TAB 2: QUALITY TESTING LOG (STOCK DEDUCTION)
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'log' && (
          <>
            {/* Form */}
            {showForm && (
              <div className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>{editingId ? 'Edit Testing Record' : 'Add New Testing Sample'}</h3>
                  <button className={styles.formClose} disabled={isSubmitting} onClick={handleCancelForm} aria-label="Close form">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                  <div className={`${styles.formField} ${styles.wide}`}>
                    <label className={styles.formLabel}>Product / Material Name *</label>
                    {editingId ? (
                      <input className={styles.formInput} value={formData.productName} disabled />
                    ) : (
                      <>
                        <input
                          type="search"
                          aria-label="Search product master"
                          placeholder="Search products by name or code"
                          value={productSearch}
                          disabled={isSubmitting}
                          onChange={e => setProductSearch(e.target.value)}
                          className={styles.formInput}
                        />
                        <select
                          required
                          aria-label="Product / Material Name"
                          value={formData.productId}
                          disabled={isSubmitting || !!productError}
                          className={styles.formInput}
                          onChange={e => setFormData({ ...formData, productId: e.target.value })}
                        >
                          <option value="">Select a product from Master Catalog</option>
                          {products
                            .filter(p => p.id === formData.productId || [p.name, p.sku, p.publicId].join(' ').toLowerCase().includes(productSearch.toLowerCase()))
                            .map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku || p.publicId})</option>)}
                        </select>
                        {productError && (
                          <div role="alert" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                            {productError} <button type="button" onClick={fetchProducts} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer' }}>Retry</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Quantity (PCS) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      disabled={isSubmitting || !!editingId}
                      placeholder="e.g. 1"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.wide}`}>
                    <label className={styles.formLabel}>Remarks / Testing Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Dimensional and pressure test parameters verified"
                      disabled={isSubmitting}
                      value={formData.remarks}
                      onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.formActions}`}>
                    <button type="submit" disabled={isSubmitting} className={styles.btnSubmit}>
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      <span>{editingId ? 'Update Record' : 'Confirm Stock Deduction'}</span>
                    </button>
                    {editingId && (
                      <button type="button" onClick={handleCancelForm} className={styles.btnCancel}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Table Card */}
            <div className={styles.tableCard}>
              <div className={styles.tableToolbar}>
                <div className={styles.tableTitle}>
                  <ClipboardList size={16} color="#0284c7" />
                  <span className={styles.tableTitleText}>Testing Log Register</span>
                  {!loading && <span className={styles.countBadge}>{records.length}</span>}
                </div>

                <div className={styles.filterGroup}>
                  <div className={styles.searchWrap}>
                    <Search className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search by name or reference…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <button
                    type="button"
                    className={styles.btnActionPrimary}
                    style={{ minHeight: '38px', padding: '8px 14px', fontSize: '13px' }}
                    onClick={() => {
                      fetchProducts();
                      setProductSearch('');
                      setShowForm(true);
                      setEditingId(null);
                      setFormData({ productId: '', productName: '', quantity: '', remarks: '' });
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Record</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className={styles.stateBox}>
                  <div className={styles.spinner} />
                  <p className={styles.stateTitle}>Loading testing records…</p>
                  <span className={styles.stateHint}>Fetching physical stock deduction history</span>
                </div>
              ) : error ? (
                <div className={styles.stateBox}>
                  <div className={styles.stateIcon}><AlertCircle size={28} color="#ef4444" /></div>
                  <p className={styles.stateTitle} style={{ color: '#ef4444' }}>Unable to load testing records</p>
                  <p className={styles.stateHint}>{error}</p>
                </div>
              ) : filteredLogRecords.length === 0 ? (
                <div className={styles.stateBox}>
                  <div className={styles.stateIcon}><ClipboardList size={28} /></div>
                  <p className={styles.stateTitle}>
                    {searchQuery ? 'No records match your search' : 'No testing records logged yet'}
                  </p>
                  <p className={styles.stateHint}>
                    {searchQuery ? 'Try a different search term.' : 'Click "Add Record" above to record physical destructive test samples.'}
                  </p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead className={styles.thead}>
                      <tr>
                        <th>Reference</th>
                        <th>Product / Material</th>
                        <th>Qty</th>
                        <th>UOM</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Created Date/Time</th>
                        <th>Stock Deducted</th>
                        <th>Remarks</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                      {filteredLogRecords.map(record => (
                        <tr key={record.id}>
                          <td>
                            <code className={styles.refCode}>{record.referenceNo}</code>
                          </td>
                          <td className={styles.productCell}>
                            <strong style={{ color: '#0f172a' }}>{record.productName}</strong>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{Number(record.quantity).toLocaleString()}</strong>
                          </td>
                          <td>PCS</td>
                          <td>
                            <StatusBadge status={record.status} />
                          </td>
                          <td style={{ fontSize: '12.5px', color: '#64748b' }}>
                            {record.createdBy?.name || record.reviewedBy || '-'}
                          </td>
                          <td style={{ fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                            {new Date(record.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca'
                            }}>
                              {record.stockDeducted == null ? 'Legacy record' : `-${record.stockDeducted} PCS`}
                            </span>
                          </td>
                          <td style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '200px' }}>
                            {record.remarks || '-'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className={styles.actions}>
                              <button
                                className={styles.actionBtn}
                                title="Print Slip"
                                onClick={() => handlePrintSlip(record)}
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.edit}`}
                                title="Edit Record"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.del}`}
                                title="Delete Record"
                                onClick={() => handleDelete(record)}
                              >
                                <Trash2 size={14} />
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
          </>
        )}
      </div>

      {/* ── Form Modal (Create / Edit Test Report) ── */}
      <TestReportFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReport(null);
        }}
        onSuccess={() => {
          fetchReports();
        }}
        initialData={editingReport}
        products={products}
        customers={customers}
      />

      {/* ── Preview & Print Modal ── */}
      <CertificatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewReport(null);
        }}
        report={previewReport}
        onReportUpdated={(updated) => {
          setPreviewReport(updated);
          fetchReports();
        }}
        onEdit={(rep) => {
          setEditingReport(rep);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteReport}
      />

      {/* ── Hidden Container for Direct Row PDF Generation ── */}
      {directDownloadReport && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            width: '794px',
            zIndex: -9999,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          {isCert2Report(directDownloadReport) ? (
            <TestCertificateDocument2
              report={directDownloadReport}
              id="hidden-direct-download-cert"
            />
          ) : (
            <TestCertificateDocument
              report={directDownloadReport}
              id="hidden-direct-download-cert"
            />
          )}
        </div>
      )}
    </div>
  );
}

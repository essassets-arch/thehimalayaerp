'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Printer, Search, Download, FileText,
  CheckCircle, XCircle, AlertCircle, ClipboardList, X, Loader2,
  Eye, RotateCcw, RefreshCw
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
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/customers?limit=1000', { cacheTtlMs: 0 });
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

  /* ── Direct PDF Download from Register Row ── */
  const handleDownloadRowPdf = async (report: TestCertificateData) => {
    setRowDownloadingId(report.id || report.reportNumber);
    setDirectDownloadReport(report);

    // Wait for the hidden certificate document to mount in the DOM
    setTimeout(async () => {
      try {
        await downloadTestCertificatePdf(report, 'hidden-direct-download-cert');
      } catch (err: any) {
        toast.error('Failed to download PDF: ' + err?.message);
      } finally {
        setRowDownloadingId(null);
      }
    }, 150);
  };

  /* ── Delete Report (Drafts only) ── */
  const handleDeleteReport = async (report: TestCertificateData) => {
    if (report.status === 'Approved') {
      Swal.fire({
        icon: 'error',
        title: 'Action Not Permitted',
        text: 'Approved test certificates are revision-controlled and cannot be deleted for audit compliance.',
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Delete Certificate?',
      text: `Are you sure you want to delete ${report.reportNumber}? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#dc2626',
    });

    if (!confirm.isConfirmed) return;

    try {
      await backendFetch(`/api/backend/production/testing/reports/${report.id}`, { method: 'DELETE' });
      toast.success('Certificate deleted');
      fetchReports();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete certificate');
    }
  };

  /* ── Quick Approve from Register ── */
  const handleQuickApprove = async (report: TestCertificateData) => {
    const rows = report.loadTestingRows || [];
    const missingLoad = rows.some((r) => !r.load || String(r.load).trim() === '');
    if (missingLoad) {
      Swal.fire({
        icon: 'warning',
        title: 'Measurements Incomplete',
        text: 'All six load sequence stages must have recorded load values before approval. Please edit the report first.',
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Approve Certificate?',
      text: `Approve and digitally sign ${report.reportNumber}?`,
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
      toast.success('Certificate approved and signed');
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
      'Date': r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-GB') : '',
      'Client Name': r.clientName,
      'P.O. No': r.poNumber || '',
      'Product Name': r.productName,
      'Clear Opening': r.clearOpening || '',
      'Quantity Supply': r.quantitySupply || '',
      'Project Name': r.projectName || '',
      'Status': r.status,
      'Tested By': r.testedByName || 'Sana Konda Reddy',
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

  const handleDelete = async (id: any) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await backendFetch(`/api/backend/production/testing/${id}`, { method: 'DELETE' });
      toast.success('Record deleted');
      fetchRecords();
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
    if (!reportSearch.trim()) return true;
    const term = reportSearch.toLowerCase();
    return (
      (r.reportNumber || '').toLowerCase().includes(term) ||
      (r.clientName || '').toLowerCase().includes(term) ||
      (r.productName || '').toLowerCase().includes(term) ||
      (r.poNumber || '').toLowerCase().includes(term) ||
      (r.projectName || '').toLowerCase().includes(term)
    );
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const map = {
      'Approved':     [styles.badgeApproved,  <CheckCircle  key="i" size={10} />, 'Approved'],
      'Rejected':     [styles.badgeRejected,  <XCircle      key="i" size={10} />, 'Rejected'],
      'Needs Retest': [styles.badgeRetest,    <AlertCircle  key="i" size={10} />, 'Needs Retest'],
      'Pending Approval': [styles.badgePending, <AlertCircle key="i" size={10} />, 'Pending Approval'],
      'Draft':        [styles.badgePending,   null, 'Draft'],
    };
    const [cls, icon, label] = (map as Record<string, any>)[status] ?? [styles.badgePending, null, status || 'Pending'];
    return (
      <span className={`${styles.badge} ${cls}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <div className={styles.page}>
      {/* ── Top Tabs Navigation ── */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'reports' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={16} />
          Testing Reports &amp; Certificates
          {reports.length > 0 && <span className={styles.tabBadge}>{reports.length}</span>}
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'log' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('log')}
        >
          <ClipboardList size={16} />
          Testing Log (Stock Deductions)
          {records.length > 0 && <span className={styles.tabBadge}>{records.length}</span>}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         TAB 1: TESTING REPORTS & CERTIFICATES (PRIMARY MODULE)
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Testing Reports &amp; Certificates</h1>
              <p className={styles.subtitle}>
                ISO / EN 124 compliant load test certificates with verified sequence stages, authorized signatures, and PDF generation.
              </p>
            </div>

            <div className={styles.headerActions}>
              <button className={`${styles.btn} ${styles.btnGreen}`} onClick={exportReportsToExcel}>
                <Download size={14} />
                <span className={styles.btnLabel}>Excel Register</span>
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setEditingReport(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus size={14} />
                New Test Certificate
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className={styles.tableCard}>
            {/* Toolbar */}
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <FileText size={15} color="#8893A7" />
                <span className={styles.tableTitleText}>Certificate Register</span>
                {!reportsLoading && <span className={styles.countBadge}>{filteredReports.length}</span>}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className={styles.selectFilter}
                  aria-label="Filter by Status"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

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
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ minHeight: '36px', padding: '6px 10px' }}
                  onClick={fetchReports}
                  title="Refresh Certificates"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* States */}
            {reportsLoading ? (
              <div className={styles.stateBox}>
                <div className={styles.spinner} />
                <span className={styles.stateHint}>Loading test certificates from database…</span>
              </div>
            ) : reportsError ? (
              <div className={styles.stateBox}>
                <div className={styles.stateIcon}><AlertCircle size={26} color="#ef4444" /></div>
                <p className={styles.stateTitle} style={{ color: '#ef4444' }}>Unable to load test certificates</p>
                <p className={styles.stateHint}>{reportsError}</p>
                <button
                  onClick={fetchReports}
                  style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '6px', background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className={styles.stateBox}>
                <div className={styles.stateIcon}><FileText size={26} /></div>
                <p className={styles.stateTitle}>
                  {reportSearch ? 'No certificates match your search' : 'No test certificates generated yet'}
                </p>
                <p className={styles.stateHint}>
                  {reportSearch ? 'Try a different search term or clear the filter' : 'Click "New Test Certificate" above to generate your first certificate'}
                </p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th>Certificate No.</th>
                      <th>Date</th>
                      <th>Client Name</th>
                      <th>Product Name</th>
                      <th>Clear Opening</th>
                      <th>Test Capacity</th>
                      <th>Status</th>
                      <th>Tested / Approved By</th>
                      <th style={{ textAlign: 'right', minWidth: '180px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tbody}>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <code className={styles.refCode}>{report.reportNumber}</code>
                          {report.revision !== undefined && (
                            <span className={styles.revBadge}>Rev {report.revision}</span>
                          )}
                        </td>
                        <td>{report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-GB') : '-'}</td>
                        <td>
                          <strong>{report.clientName}</strong>
                          {report.poNumber && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>PO: {report.poNumber}</div>
                          )}
                        </td>
                        <td className={styles.productCell}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{report.productName}</div>
                          {report.projectName && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Proj: {report.projectName}</div>
                          )}
                        </td>
                        <td>{report.clearOpening || '-'}</td>
                        <td>
                          <strong>{report.finalLoadTon ? `${report.finalLoadTon} Ton` : report.cycleLoadsTon ? `${report.cycleLoadsTon} Ton` : '-'}</strong>
                        </td>
                        <td>
                          <StatusBadge status={report.status || 'Draft'} />
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          <div>Tested: {report.testedByName || 'Sana Konda Reddy'}</div>
                          {report.approvedByName && (
                            <div style={{ color: '#166534', fontWeight: 600 }}>Appr: {report.approvedByName}</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actions} style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
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
                                title="Approve & Sign"
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

                            {/* Delete Action (if draft or rejected) */}
                            {report.status !== 'Approved' && (
                              <button
                                className={`${styles.actionBtn} ${styles.del}`}
                                title="Delete Certificate"
                                onClick={() => handleDeleteReport(report)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
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

      {/* ══════════════════════════════════════════════════════════════════
         TAB 2: QUALITY TESTING LOG (STOCK DEDUCTION)
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'log' && (
        <>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Production Testing Log</h1>
              <p className={styles.subtitle}>Manage physical sample testing records and finished goods stock deductions.</p>
            </div>

            <div className={styles.headerActions}>
              <button className={`${styles.btn} ${styles.btnGreen}`} onClick={exportToExcel}>
                <Download size={14} />
                <span className={styles.btnLabel}>Excel</span>
              </button>
              <button className={`${styles.btn} ${styles.btnRed}`} onClick={exportToPDF}>
                <FileText size={14} />
                <span className={styles.btnLabel}>PDF</span>
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={isSubmitting}
                onClick={() => {
                  fetchProducts();
                  setProductSearch('');
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ productId: '', productName: '', quantity: '', remarks: '' });
                }}
              >
                <Plus size={14} />
                Add Record
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>{editingId ? 'Edit Record' : 'Add New Record'}</h3>
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
                        <option value="">Select a product</option>
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
                    placeholder="e.g. 50"
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
                  <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSubmit}`}>
                    {isSubmitting ? <Loader2 size={14} className={styles.spinnerIcon} /> : <Plus size={14} />}
                    {editingId ? 'Update Record' : 'Add to Log'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelForm} className={`${styles.btn} ${styles.btnCancel}`}>
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
                <ClipboardList size={15} color="#8893A7" />
                <span className={styles.tableTitleText}>Testing Log Register</span>
                {!loading && <span className={styles.countBadge}>{records.length}</span>}
              </div>

              <div className={styles.searchWrap}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name or ref…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {loading ? (
              <div className={styles.stateBox}>
                <div className={styles.spinner} />
                <span className={styles.stateHint}>Loading testing records…</span>
              </div>
            ) : error ? (
              <div className={styles.stateBox}>
                <div className={styles.stateIcon}><AlertCircle size={26} color="#ef4444" /></div>
                <p className={styles.stateTitle} style={{ color: '#ef4444' }}>Unable to load testing records</p>
                <p className={styles.stateHint}>{error}</p>
              </div>
            ) : filteredLogRecords.length === 0 ? (
              <div className={styles.stateBox}>
                <div className={styles.stateIcon}><ClipboardList size={26} /></div>
                <p className={styles.stateTitle}>
                  {searchQuery ? 'No records match your search' : 'No testing records yet'}
                </p>
                <p className={styles.stateHint}>
                  {searchQuery ? 'Try a different search term' : 'Click "Add Record" above to get started'}
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
                          <strong>{record.productName}</strong>
                        </td>
                        <td>
                          <strong>{Number(record.quantity).toLocaleString()}</strong>
                        </td>
                        <td>PCS</td>
                        <td>
                          <StatusBadge status={record.status} />
                        </td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>
                          {record.createdBy?.name || record.reviewedBy || '-'}
                        </td>
                        <td>{new Date(record.createdAt).toLocaleString()}</td>
                        <td>{record.stockDeducted == null ? 'Legacy record' : `-${record.stockDeducted} PCS`}</td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>
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
                              disabled={record.stockDeducted != null}
                              title={record.stockDeducted != null ? "Stock-consuming records are retained for audit" : "Delete Record"}
                              onClick={() => handleDelete(record.id)}
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
          <TestCertificateDocument
            report={directDownloadReport}
            id="hidden-direct-download-cert"
          />
        </div>
      )}
    </div>
  );
}

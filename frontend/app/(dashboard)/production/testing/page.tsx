'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Printer, Search, Download, FileText,
  CheckCircle, XCircle, AlertCircle, ClipboardList, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { backendFetch } from '@/lib/backendFetch';
import { safeSaveFile } from '@/services/export.service';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import styles from './testing.module.css';

export default function ProductionTestingPage() {
  const queryClient = useQueryClient();
  const submitting = useRef(false);
  const pendingRequest = useRef<{ fingerprint: string; id: string } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productError, setProductError] = useState('');
  const [records, setRecords]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [products, setProducts]       = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]       = useState({ productId: '', productName: '', quantity: '', remarks: '' });
  const [editingId, setEditingId]     = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm]       = useState(false);

  /* ── Load Products Master for Dropdown ── */
  const fetchProducts = async () => {
    try {
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/products?scope=catalog&limit=5000');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
      setProductError('');
    } catch (err) {
      setProductError('Unable to load products. Please retry.');
    }
  };

  /* ── Load Testing Records ── */
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/production/testing', { cacheTtlMs: 0 });
      const dataList = Array.isArray(res) ? res : (res?.data || []);
      setRecords(dataList);
    } catch (err: any) {
      setError(err?.message || 'Unable to load testing records.');
      toast.error('Unable to load testing records from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchProducts();
  }, []);

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
      await Swal.fire({ icon: 'success', title: editingId ? 'Testing notes updated' : 'Testing record added successfully',
        text: editingId ? undefined : qtyNum + ' PCS deducted from stock.' });
    } catch (err: any) {
      toast.error(err?.message || 'Unable to confirm submission. Retry the same record to check its result safely.');
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

  const filtered = records.filter(r =>
    (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.referenceNo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const map = {
      'Approved':     [styles.badgeApproved,  <CheckCircle  key="i" size={10} />, 'Approved'],
      'Rejected':     [styles.badgeRejected,  <XCircle      key="i" size={10} />, 'Rejected'],
      'Needs Retest': [styles.badgeRetest,    <AlertCircle  key="i" size={10} />, 'Needs Retest'],
    };
    const [cls, icon, label] = (map as Record<string, any>)[status] ?? [styles.badgePending, null, 'Pending'];
    return (
      <span className={`${styles.badge} ${cls}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Production Testing Log</h1>
          <p className={styles.subtitle}>Manage quality testing records for manufactured products.</p>
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
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ productId: '', productName: '', quantity: '', remarks: '' }); }}
          >
            <Plus size={14} />
            Add Record
          </button>
        </div>
      </div>

      {/* ── Slide-down Form ── */}
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
              {editingId ? <input className={styles.formInput} value={formData.productName} disabled /> : <>
                <input type="search" aria-label="Search product master" placeholder="Search products by name or code"
                  value={productSearch} disabled={isSubmitting}
                  onChange={e => setProductSearch(e.target.value)} className={styles.formInput} />
                <select required aria-label="Product / Material Name" value={formData.productId}
                  disabled={isSubmitting || !!productError} className={styles.formInput}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                  <option value="">Select a product</option>
                  {products.filter(p => p.id === formData.productId ||
                    [p.name, p.sku, p.publicId].join(' ').toLowerCase().includes(productSearch.toLowerCase()))
                    .map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku || p.publicId})</option>)}
                </select>
                {productError && <div role="alert">{productError} <button type="button" onClick={fetchProducts}>Retry</button></div>}
              </>}
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
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSubmit}`}
              >
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

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>
        {/* Toolbar */}
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

        {/* States */}
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
        ) : filtered.length === 0 ? (
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
                {filtered.map(record => (
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
    </div>
  );
}

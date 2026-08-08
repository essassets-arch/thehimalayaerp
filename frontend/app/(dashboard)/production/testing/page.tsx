'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Printer, Search, Download, FileText,
  CheckCircle, XCircle, AlertCircle, ClipboardList, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { backendFetch } from '@/lib/backendFetch';
import styles from './testing.module.css';

export default function ProductionTestingPage() {
  const [records, setRecords]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [products, setProducts]       = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]       = useState({ productName: '', quantity: '', remarks: '' });
  const [editingId, setEditingId]     = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm]       = useState(false);

  /* ── Load Products Master for Dropdown ── */
  const fetchProducts = async () => {
    try {
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/production/finished-goods');
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
    } catch (err) {
      // Non-blocking fallback
    }
  };

  /* ── Load Testing Records ── */
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch<{ success?: boolean; data?: any[] }>('/api/backend/production/testing');
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
    if (!formData.productName.trim() || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    const qtyNum = Number(formData.quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId
        ? `/api/backend/production/testing/${editingId}`
        : '/api/backend/production/testing';

      await backendFetch(endpoint, {
        method,
        body: {
          productName: formData.productName.trim(),
          quantity: qtyNum,
          remarks: formData.remarks.trim() || undefined,
        },
      });

      toast.success(editingId ? 'Testing record updated' : 'Testing record added');
      setFormData({ productName: '', quantity: '', remarks: '' });
      setEditingId(null);
      setShowForm(false);
      await fetchRecords();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save testing record');
    } finally {
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
      productName: record.productName,
      quantity: String(record.quantity),
      remarks: record.remarks || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setFormData({ productName: '', quantity: '', remarks: '' });
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

  const exportToPDF = () => {
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
    doc.save(`testing_log_${new Date().toISOString().split('T')[0]}.pdf`);
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
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ productName: '', quantity: '', remarks: '' }); }}
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
            <button className={styles.formClose} onClick={handleCancelForm} aria-label="Close form">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={`${styles.formField} ${styles.wide}`}>
              <label className={styles.formLabel}>Product / Material Name *</label>
              <input
                type="text"
                list="product-master-list"
                required
                placeholder="Select or type product name (e.g. FG-920911 — Hydraulic Cylinder 50mm DB Test)"
                value={formData.productName}
                onChange={e => setFormData({ ...formData, productName: e.target.value })}
                className={styles.formInput}
              />
              <datalist id="product-master-list">
                {products.map((p, idx) => (
                  <option
                    key={p.id || idx}
                    value={`${p.productCode && p.productCode !== '-' ? p.productCode + ' — ' : ''}${p.productName}`}
                  />
                ))}
              </datalist>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Quantity (PCS) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
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
                  <th>Tested By</th>
                  <th>Remarks</th>
                  <th>Actions</th>
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
                      {record.reviewedBy || 'Production Supervisor'}
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {record.remarks || '-'}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.iconBtn}
                          title="Print Slip"
                          onClick={() => handlePrintSlip(record)}
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          title="Edit Record"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          title="Delete Record"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 size={13} />
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

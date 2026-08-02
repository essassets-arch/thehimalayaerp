'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Printer, Search, Download, FileText,
  CheckCircle, XCircle, AlertCircle, ClipboardList, X
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './testing.module.css';

export default function ProductionTestingPage() {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [formData, setFormData]   = useState({ productName: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm]   = useState(false);

  /* ── API helpers ── */
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/production/testing');
      if (res.ok) {
        const json = await res.json();
        setRecords(Array.isArray(json) ? json : (json.data ?? []));
      }
    } catch {
      toast.error('Failed to load testing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.quantity) {
      toast.error('Please fill in all fields');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/v1/production/testing/${editingId}`
        : '/api/v1/production/testing';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName.trim(),
          quantity: Number(formData.quantity),
        }),
      });
      if (res.ok) {
        toast.success(editingId ? 'Record updated' : 'Record added');
        setFormData({ productName: '', quantity: '' });
        setEditingId(null);
        setShowForm(false);
        fetchRecords();
      } else {
        toast.error('Failed to save record');
      }
    } catch {
      toast.error('An error occurred while saving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/v1/production/testing/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Record deleted'); fetchRecords(); }
      else toast.error('Failed to delete record');
    } catch {
      toast.error('Error deleting record');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({ productName: record.productName, quantity: record.quantity });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setFormData({ productName: '', quantity: '' });
    setShowForm(false);
  };

  const handlePrintSlip = (record) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Slip – ${record.referenceNo}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #111827; }
        .card { border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; max-width: 480px; margin: 0 auto; }
        .hd { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px; }
        h2 { margin: 0 0 4px; font-size: 22px; } p { margin: 0; color: #6b7280; font-size: 13px; }
        .row { display: flex; justify-content: space-between; margin: 10px 0; padding-bottom: 8px; border-bottom: 1px dashed #e5e7eb; }
        .row:last-of-type { border-bottom: none; } .lbl { font-weight: 600; color: #4b5563; }
        .badge { padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .Pending { background:#fef9c3; color:#854d0e; } .Approved { background:#dcfce7; color:#166534; }
        .Rejected { background:#fee2e2; color:#991b1b; } .footer { margin-top: 28px; text-align:center; font-size:11px; color:#9ca3af; }
      </style></head><body>
      <div class="card">
        <div class="hd"><h2>Quality Testing Slip</h2><p>Himalaya Wellness Company</p></div>
        <div class="row"><span class="lbl">Reference:</span><span>${record.referenceNo}</span></div>
        <div class="row"><span class="lbl">Product:</span><span>${record.productName}</span></div>
        <div class="row"><span class="lbl">Quantity:</span><span>${record.quantity}</span></div>
        <div class="row"><span class="lbl">Status:</span><span class="badge ${record.status.replace(' ','')}">${record.status}</span></div>
        ${record.remarks ? `<div class="row"><span class="lbl">Remarks:</span><span>${record.remarks}</span></div>` : ''}
        ${record.reviewedBy ? `<div class="row"><span class="lbl">Reviewed By:</span><span>${record.reviewedBy}</span></div>` : ''}
        <div class="row"><span class="lbl">Created:</span><span>${new Date(record.createdAt).toLocaleString()}</span></div>
        <div class="footer">Generated by ERP System</div>
      </div>
      <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  const exportToExcel = () => {
    const wsData = records.map(r => ({
      'Reference No': r.referenceNo, 'Product Name': r.productName,
      Quantity: r.quantity, Status: r.status,
      Remarks: r.remarks || '', 'Reviewed By': r.reviewedBy || '',
      'Date Created': new Date(r.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Testing Records');
    XLSX.writeFile(wb, `testing_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Production Testing Records', 14, 15);
    doc.autoTable({
      head: [['Reference', 'Product', 'Qty', 'Status', 'Remarks', 'Date']],
      body: records.map(r => [
        r.referenceNo, r.productName, r.quantity, r.status,
        r.remarks || '-', new Date(r.createdAt).toLocaleDateString(),
      ]),
      startY: 20,
    });
    doc.save(`testing_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filtered = records.filter(r =>
    r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusBadge = ({ status }) => {
    const map = {
      'Approved':     [styles.badgeApproved,  <CheckCircle  key="i" size={10} />, 'Approved'],
      'Rejected':     [styles.badgeRejected,  <XCircle      key="i" size={10} />, 'Rejected'],
      'Needs Retest': [styles.badgeRetest,    <AlertCircle  key="i" size={10} />, 'Needs Retest'],
    };
    const [cls, icon, label] = map[status] ?? [styles.badgePending, null, 'Pending'];
    return (
      <span className={`${styles.badge} ${cls}`}>
        {icon} {label}
      </span>
    );
  };

  /* ── Render ── */
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
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ productName: '', quantity: '' }); }}
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
              <label className={styles.formLabel}>Product / Material Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Steel Pipe 50mm"
                value={formData.productName}
                onChange={e => setFormData({ ...formData, productName: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Quantity</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                placeholder="0"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={`${styles.formField} ${styles.formActions}`}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSubmit}`}>
                <Plus size={14} />
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
            {!loading && <span className={styles.countBadge}>{filtered.length}</span>}
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
            <span className={styles.stateHint}>Loading records…</span>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {filtered.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div className={styles.refNo}>{record.referenceNo}</div>
                      <div className={styles.refDate}>{new Date(record.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className={styles.productName}>{record.productName}</div>
                      {record.remarks && (
                        <div className={styles.remarks} title={record.remarks}>{record.remarks}</div>
                      )}
                    </td>
                    <td className={styles.qty}>{record.quantity}</td>
                    <td><StatusBadge status={record.status} /></td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handlePrintSlip(record)}
                          title="Print Slip"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => handleEdit(record)}
                          disabled={record.status !== 'Pending'}
                          title={record.status !== 'Pending' ? 'Cannot edit reviewed records' : 'Edit'}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.del}`}
                          onClick={() => handleDelete(record.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
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

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TableProperties,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calculator,
  Save,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  fetchHcpplArSummary,
  fetchHcpplArEntries,
  createHcpplArEntry,
  updateHcpplArEntry,
  deleteHcpplArEntry
} from '../services/backOfficeArService';

// Format Indian Rupee currency with exact 2 decimal preservation
function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  const num = Number(value);
  const parts = num.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return `₹${integerPart}.${decimalPart}`;
}

// Format Date string DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
}

// Live calculation preview helper for modal
function calculatePreview(invoiceDateStr, termDaysNum, invAmtNum, rcvdAmtNum) {
  const invDate = invoiceDateStr ? new Date(invoiceDateStr) : new Date();
  const termDays = Number(termDaysNum) || 30;
  const dueDate = new Date(invDate.getTime() + termDays * 24 * 60 * 60 * 1000);

  // Indian FY Quarter (Apr-Jun Q1, Jul-Sep Q2, Oct-Dec Q3, Jan-Mar Q4)
  const m = invDate.getMonth();
  const y = invDate.getFullYear();
  let qNum, sYear, eYear;
  if (m >= 3 && m <= 5) {
    qNum = 1; sYear = y; eYear = y + 1;
  } else if (m >= 6 && m <= 8) {
    qNum = 2; sYear = y; eYear = y + 1;
  } else if (m >= 9 && m <= 11) {
    qNum = 3; sYear = y; eYear = y + 1;
  } else {
    qNum = 4; sYear = y - 1; eYear = y;
  }
  const quarter = `Q${qNum}-${sYear}/${String(eYear).slice(-2)}`;

  // Outstanding
  const invAmt = Number(invAmtNum) || 0;
  const rcvdAmt = Number(rcvdAmtNum) || 0;
  const outstanding = Number((invAmt - rcvdAmt).toFixed(2));

  // Ageing
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  let ageingDays = 0;
  let ageingBucket = 'Yet To Due';

  if (diffDays > 0) {
    ageingDays = diffDays;
    if (diffDays <= 30) ageingBucket = '1-30 Days';
    else if (diffDays <= 45) ageingBucket = '31-45 Days';
    else if (diffDays <= 60) ageingBucket = '46-60 Days';
    else if (diffDays <= 90) ageingBucket = '61-90 Days';
    else if (diffDays <= 120) ageingBucket = '91-120 Days';
    else ageingBucket = 'More than 120 Days';
  }

  return { dueDate, quarter, outstanding, ageingDays, ageingBucket };
}

export default function BackOfficeHcpplAr() {
  // Summary matrix state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Underlying records state
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [showEntries, setShowEntries] = useState(true);
  const [entrySearch, setEntrySearch] = useState('');
  const [entrySection, setEntrySection] = useState('ALL'); // 'ALL' | 'UNPAID' | 'RT'
  const [entryQuarter, setEntryQuarter] = useState('ALL');
  const [entryPagination, setEntryPagination] = useState({
    page: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1
  });

  // Responsive Mobile State
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal / Data Entry state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeItem, setActiveItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    basicAmount: '',
    invoiceAmount: '',
    companyName: '',
    siteName: '',
    city: 'Ahmedabad',
    salesType: 'Regular', // 'Regular' for Unpaid, 'RT' for RT matrix
    salesPerson: '',
    paymentTermDays: 30,
    status: 'UNPAID', // 'UNPAID' | 'RT' | 'PARTIAL' | 'PAID'
    amtRcvd: 0,
    amtRcvdDate: '',
    remarks: ''
  });

  // Load summary matrix data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHcpplArSummary();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to fetch HCPPL AR summary:', err);
      setError('Unable to load HCPPL AR Summary from backend. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load underlying records
  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    try {
      const res = await fetchHcpplArEntries({
        search: entrySearch,
        section: entrySection,
        quarter: entryQuarter,
        page: entryPagination.page,
        limit: entryPagination.limit
      });
      if (res) {
        setEntries(res.items || []);
        if (res.pagination) {
          setEntryPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch HCPPL AR entries:', err);
    } finally {
      setEntriesLoading(false);
    }
  }, [entrySearch, entrySection, entryQuarter, entryPagination.page, entryPagination.limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Open Create Modal
  const handleOpenCreate = (defaultType = 'Regular') => {
    setModalMode('create');
    setActiveItem(null);
    setFormError(null);
    setFormData({
      invoiceNumber: `HCPPL/2627/${String(entryPagination.totalItems + 1).padStart(4, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      basicAmount: '',
      invoiceAmount: '',
      companyName: '',
      siteName: '',
      city: 'Ahmedabad',
      salesType: defaultType === 'RT' ? 'RT' : 'Regular',
      salesPerson: '',
      paymentTermDays: 30,
      status: defaultType === 'RT' ? 'RT' : 'UNPAID',
      amtRcvd: 0,
      amtRcvdDate: '',
      remarks: ''
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setActiveItem(item);
    setFormError(null);
    setFormData({
      invoiceNumber: item.invoiceNumber,
      invoiceDate: item.invoiceDate ? new Date(item.invoiceDate).toISOString().split('T')[0] : '',
      basicAmount: item.basicAmount,
      invoiceAmount: item.invoiceAmount,
      companyName: item.companyName,
      siteName: item.siteName === '-' ? '' : (item.siteName || ''),
      city: item.city === '-' ? '' : (item.city || ''),
      salesType: item.salesType || (item.status === 'RT' ? 'RT' : 'Regular'),
      salesPerson: item.salesPerson === '-' ? '' : (item.salesPerson || ''),
      paymentTermDays: item.paymentTermDays,
      status: item.status,
      amtRcvd: item.amtRcvd || 0,
      amtRcvdDate: item.amtRcvdDate ? new Date(item.amtRcvdDate).toISOString().split('T')[0] : '',
      remarks: item.remarks || ''
    });
    setModalOpen(true);
  };

  // Save Form (Create or Update)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !formData.companyName) {
      setFormError('Invoice Number and Company Name are required.');
      return;
    }
    if (!formData.basicAmount || isNaN(Number(formData.basicAmount)) || Number(formData.basicAmount) < 0) {
      setFormError('Please enter a valid Basic Amount.');
      return;
    }
    if (!formData.invoiceAmount || isNaN(Number(formData.invoiceAmount)) || Number(formData.invoiceAmount) < 0) {
      setFormError('Please enter a valid Invoice Amount (Total with GST).');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const isRt = formData.salesType === 'RT' || formData.status === 'RT';
      const invAmt = Number(formData.invoiceAmount);
      const rcvd = Number(formData.amtRcvd) || 0;
      const payload = {
        ...formData,
        basicAmount: Number(formData.basicAmount),
        invoiceAmount: invAmt,
        isRt,
        status: isRt ? 'RT' : (invAmt - rcvd <= 0 ? 'PAID' : (rcvd > 0 ? 'PARTIAL' : 'UNPAID'))
      };

      if (modalMode === 'create') {
        await createHcpplArEntry(payload);
        setSuccessMsg(`Successfully created HCPPL invoice: ${formData.invoiceNumber}`);
      } else {
        await updateHcpplArEntry(activeItem.id, payload);
        setSuccessMsg(`Successfully updated HCPPL invoice: ${formData.invoiceNumber}`);
      }
      setModalOpen(false);
      // Auto-refresh summary matrices AND entries list
      await Promise.all([loadData(), loadEntries()]);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to save HCPPL entry:', err);
      setFormError(err.message || 'Error saving invoice record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (item) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${item.invoiceNumber} (${item.companyName})?`)) {
      return;
    }
    try {
      await deleteHcpplArEntry(item.id);
      setSuccessMsg(`Deleted invoice: ${item.invoiceNumber}`);
      await Promise.all([loadData(), loadEntries()]);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to delete HCPPL entry:', err);
      alert('Failed to delete entry: ' + (err.message || 'Unknown error'));
    }
  };

  // Form calculations preview
  const formPreview = useMemo(() => {
    return calculatePreview(
      formData.invoiceDate,
      formData.paymentTermDays,
      formData.invoiceAmount || formData.basicAmount,
      formData.amtRcvd
    );
  }, [formData.invoiceDate, formData.paymentTermDays, formData.invoiceAmount, formData.basicAmount, formData.amtRcvd]);

  // Export Summary Matrix to CSV
  const handleExportCsv = () => {
    if (!data) return;

    const generateSectionLines = (title, section) => {
      const lines = [
        `\n--- ${title} ---`,
        'Ageing,Q1 Bill Count,Q1 Inv Amount,Q2 Bill Count,Q2 Inv Amount,Q3 Bill Count,Q3 Inv Amount,Q4 Bill Count,Q4 Inv Amount,Overall Bill Count,Overall Inv Amount'
      ];

      section.rows.forEach(r => {
        lines.push(
          `"${r.ageing}",${r.q1.billCount},${r.q1.invAmount},${r.q2.billCount},${r.q2.invAmount},${r.q3.billCount},${r.q3.invAmount},${r.q4.billCount},${r.q4.invAmount},${r.overall.billCount},${r.overall.invAmount}`
        );
      });

      const t = section.total;
      lines.push(
        `"Total",${t.q1.billCount},${t.q1.invAmount},${t.q2.billCount},${t.q2.invAmount},${t.q3.billCount},${t.q3.invAmount},${t.q4.billCount},${t.q4.invAmount},${t.overall.billCount},${t.overall.invAmount}`
      );

      return lines;
    };

    const unpaidLines = generateSectionLines('SECTION 1 — UNPAID', data.unpaid);
    const rtLines = generateSectionLines('SECTION 2 — RT', data.rt);

    const summaryHeader = [
      'HIMALAYA COMPOSITES PRIVATE LIMITED — HCPPL AR SUMMARY SHEET',
      `Export Date: ${new Date().toLocaleDateString('en-IN')}`,
      `Total Unpaid Outstanding: ${data.summary?.unpaidInvAmount}`,
      `Total RT Outstanding: ${data.summary?.rtInvAmount}`,
      `Combined Receivables: ${data.summary?.combinedInvAmount}`
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([
      ...summaryHeader,
      ...unpaidLines,
      ...rtLines
    ].join('\n'));

    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `HCPPL_AR_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reusable Matrix Table Component
  const renderMatrixTable = (title, section, isRt = false) => {
    if (!section) return null;

    return (
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px', overflow: 'hidden' }}>
        {/* Section Header Banner */}
        <div style={{
          padding: '16px 20px',
          background: isRt ? '#faf5ff' : '#f0fdf4',
          borderBottom: isRt ? '1px solid #e9d5ff' : '1px solid #bbf7d0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              background: isRt ? '#7c3aed' : '#16a34a',
              color: '#fff'
            }}>
              {isRt ? 'SECTION 2' : 'SECTION 1'}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: isRt ? '#581c87' : '#14532d', margin: 0 }}>
              {title}
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              (100% System-Calculated from Underlying Records)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: isRt ? '#7c3aed' : '#15803d' }}>
              Overall: {formatCurrency(section.total?.overall?.invAmount)} ({section.total?.overall?.billCount} Bills)
            </div>

            <button
              onClick={() => handleOpenCreate(isRt ? 'RT' : 'Regular')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                background: isRt ? '#7c3aed' : '#16a34a',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={13} />
              Add {isRt ? 'RT' : 'Unpaid'} Entry
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', whiteSpace: 'nowrap' }}>
            <thead>
              {/* Row 1: Quarters */}
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th
                  rowSpan={2}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#0f172a',
                    borderRight: '2px solid #cbd5e1',
                    background: '#f1f5f9',
                    width: '180px'
                  }}
                >
                  Ageing
                </th>
                <th colSpan={2} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: '#0369a1', borderRight: '1px solid #cbd5e1', background: '#e0f2fe' }}>
                  Q1-2026/27
                </th>
                <th colSpan={2} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: '#0284c7', borderRight: '1px solid #cbd5e1', background: '#f0f9ff' }}>
                  Q2-2026/27
                </th>
                <th colSpan={2} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: '#4338ca', borderRight: '1px solid #cbd5e1', background: '#e0e7ff' }}>
                  Q3-2026/27
                </th>
                <th colSpan={2} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: '#6d28d9', borderRight: '2px solid #cbd5e1', background: '#ede9fe' }}>
                  Q4-2026/27
                </th>
                <th colSpan={2} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '800', color: '#0f172a', background: '#fef3c7' }}>
                  Overall
                </th>
              </tr>

              {/* Row 2: Bill Count & Inv Amount */}
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '600', borderRight: '1px solid #e2e8f0' }}>Bill Count</th>
                <th style={{ padding: '6px 14px', textAlign: 'right', color: '#0369a1', fontWeight: '700', borderRight: '1px solid #cbd5e1' }}>Inv Amount</th>

                <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '600', borderRight: '1px solid #e2e8f0' }}>Bill Count</th>
                <th style={{ padding: '6px 14px', textAlign: 'right', color: '#0284c7', fontWeight: '700', borderRight: '1px solid #cbd5e1' }}>Inv Amount</th>

                <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '600', borderRight: '1px solid #e2e8f0' }}>Bill Count</th>
                <th style={{ padding: '6px 14px', textAlign: 'right', color: '#4338ca', fontWeight: '700', borderRight: '1px solid #cbd5e1' }}>Inv Amount</th>

                <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '600', borderRight: '1px solid #e2e8f0' }}>Bill Count</th>
                <th style={{ padding: '6px 14px', textAlign: 'right', color: '#6d28d9', fontWeight: '700', borderRight: '2px solid #cbd5e1' }}>Inv Amount</th>

                <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '700', borderRight: '1px solid #e2e8f0', background: '#fffbeb' }}>Bill Count</th>
                <th style={{ padding: '6px 14px', textAlign: 'right', color: '#b45309', fontWeight: '800', background: '#fffbeb' }}>Inv Amount</th>
              </tr>
            </thead>

            <tbody>
              {section.rows.map((row, idx) => {
                const isOverdue = row.ageing !== 'Yet To Due';
                return (
                  <tr
                    key={row.ageing}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isRt ? '#faf5ff' : '#f0fdf4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f8fafc'; }}
                  >
                    {/* Ageing Row Header */}
                    <td style={{
                      padding: '10px 16px',
                      fontWeight: '700',
                      color: isOverdue ? '#b91c1c' : '#1e293b',
                      borderRight: '2px solid #cbd5e1',
                      background: idx % 2 === 0 ? '#fff' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: row.ageing === 'Yet To Due' ? '#10b981'
                            : row.ageing === '1-30 Days' ? '#38bdf8'
                            : row.ageing === '31-45 Days' ? '#818cf8'
                            : row.ageing === '46-60 Days' ? '#f59e0b'
                            : row.ageing === '61-90 Days' ? '#f97316'
                            : '#ef4444'
                        }} />
                        {row.ageing}
                      </div>
                    </td>

                    {/* Q1 */}
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                      {row.q1.billCount}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: row.q1.invAmount > 0 ? '#0369a1' : '#94a3b8', borderRight: '1px solid #cbd5e1' }}>
                      {formatCurrency(row.q1.invAmount)}
                    </td>

                    {/* Q2 */}
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                      {row.q2.billCount}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: row.q2.invAmount > 0 ? '#0284c7' : '#94a3b8', borderRight: '1px solid #cbd5e1' }}>
                      {formatCurrency(row.q2.invAmount)}
                    </td>

                    {/* Q3 */}
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                      {row.q3.billCount}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: row.q3.invAmount > 0 ? '#4338ca' : '#94a3b8', borderRight: '1px solid #cbd5e1' }}>
                      {formatCurrency(row.q3.invAmount)}
                    </td>

                    {/* Q4 */}
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                      {row.q4.billCount}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: row.q4.invAmount > 0 ? '#6d28d9' : '#94a3b8', borderRight: '2px solid #cbd5e1' }}>
                      {formatCurrency(row.q4.invAmount)}
                    </td>

                    {/* Overall */}
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '700', color: '#0f172a', borderRight: '1px solid #f1f5f9', background: '#fffbeb' }}>
                      {row.overall.billCount}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#b45309', background: '#fffbeb' }}>
                      {formatCurrency(row.overall.invAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* TOTAL Row */}
            <tfoot style={{ borderTop: '2px solid #cbd5e1', background: '#f1f5f9' }}>
              <tr style={{ fontWeight: '800', color: '#0f172a' }}>
                <td style={{ padding: '14px 16px', borderRight: '2px solid #cbd5e1', color: '#0f172a', fontSize: '13px' }}>
                  Total
                </td>

                {/* Q1 Total */}
                <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                  {section.total.q1.billCount}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', color: '#0369a1', borderRight: '1px solid #cbd5e1' }}>
                  {formatCurrency(section.total.q1.invAmount)}
                </td>

                {/* Q2 Total */}
                <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                  {section.total.q2.billCount}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', color: '#0284c7', borderRight: '1px solid #cbd5e1' }}>
                  {formatCurrency(section.total.q2.invAmount)}
                </td>

                {/* Q3 Total */}
                <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                  {section.total.q3.billCount}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', color: '#4338ca', borderRight: '1px solid #cbd5e1' }}>
                  {formatCurrency(section.total.q3.invAmount)}
                </td>

                {/* Q4 Total */}
                <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                  {section.total.q4.billCount}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', color: '#6d28d9', borderRight: '2px solid #cbd5e1' }}>
                  {formatCurrency(section.total.q4.invAmount)}
                </td>

                {/* Overall Total */}
                <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1', background: '#fef3c7', fontSize: '13px' }}>
                  {section.total.overall.billCount}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', color: '#b45309', background: '#fef3c7', fontSize: '13px' }}>
                  {formatCurrency(section.total.overall.invAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: isMobile ? '12px 12px 28px' : '24px 32px', maxWidth: '100%', minHeight: '100vh', background: '#f8fafc', overflowX: 'hidden' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px', background: '#16a34a', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TableProperties size={isMobile ? 18 : 22} />
            </div>
            <h1 style={{ fontSize: isMobile ? '19px' : '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              HCPPL AR — Summary Sheet
            </h1>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d' }}>
              EXECUTIVE MATRIX
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Himalaya Composites Private Limited • Dual Matrix (Unpaid & RT) calculated automatically from HCPPL entries
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <button
            onClick={() => handleOpenCreate('Regular')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '8px 14px' : '9px 16px',
              background: '#16a34a',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
              flex: isMobile ? '1 1 auto' : 'none'
            }}
          >
            <Plus size={16} />
            Add Entry
          </button>

          <button
            onClick={() => { loadData(); loadEntries(); }}
            title="Refresh"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {!isMobile && 'Refresh'}
          </button>

          <button
            onClick={handleExportCsv}
            title="Export Summary CSV"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#0284c7',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            {!isMobile && 'Export'}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', color: '#166534', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      {data?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: isMobile ? '12px 14px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Section 1: Unpaid Total Outstanding
            </div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#16a34a' }}>
              {formatCurrency(data.summary.unpaidInvAmount)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {data.summary.unpaidBillCount} Commercial Invoices Across All Quarters
            </div>
          </div>

          <div style={{ background: '#fff', padding: isMobile ? '12px 14px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Section 2: RT (Retention) Outstanding
            </div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#7c3aed' }}>
              {formatCurrency(data.summary.rtInvAmount)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {data.summary.rtBillCount} Retention / RT Invoices Across All Quarters
            </div>
          </div>

          <div style={{ background: '#fff', padding: isMobile ? '12px 14px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #0284c7' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Combined HCPPL Portfolio
            </div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#0f172a' }}>
              {formatCurrency(data.summary.combinedInvAmount)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {data.summary.combinedBillCount} Total Bills across FY 2026/27
            </div>
          </div>
        </div>
      )}

      {/* 3. Error Banner */}
      {error && (
        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* 4. Loading State */}
      {loading && !data && (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading HCPPL AR Summary Matrices...</div>
        </div>
      )}

      {/* 5. Section 1 — Unpaid Matrix */}
      {data && renderMatrixTable('Unpaid', data.unpaid, false)}

      {/* 6. Section 2 — RT Matrix */}
      {data && renderMatrixTable('RT', data.rt, true)}

      {/* 7. Underlying HCPPL Records Maintenance Section */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginTop: '36px' }}>
        {/* Accordion / Section Header */}
        <div
          onClick={() => setShowEntries(!showEntries)}
          style={{
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={18} color="#0f172a" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Underlying HCPPL Invoices & Data Entry Register
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ({entryPagination.totalItems} total records)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
            <span>{showEntries ? 'Hide Invoices' : 'Show Invoices'}</span>
            {showEntries ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {showEntries && (
          <div style={{ padding: '20px' }}>
            {/* Filter controls for underlying records */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search invoice, company, sales person..."
                  value={entrySearch}
                  onChange={(e) => { setEntrySearch(e.target.value); setEntryPagination(p => ({ ...p, page: 1 })); }}
                  style={{ width: '100%', padding: '8px 12px 8px 34px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <select
                  value={entrySection}
                  onChange={(e) => { setEntrySection(e.target.value); setEntryPagination(p => ({ ...p, page: 1 })); }}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
                >
                  <option value="ALL">All Sections (Unpaid & RT)</option>
                  <option value="UNPAID">Section 1: Unpaid Only</option>
                  <option value="RT">Section 2: RT (Retention) Only</option>
                </select>
              </div>

              <div>
                <select
                  value={entryQuarter}
                  onChange={(e) => { setEntryQuarter(e.target.value); setEntryPagination(p => ({ ...p, page: 1 })); }}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
                >
                  <option value="ALL">All Quarters</option>
                  <option value="Q1-2026/27">Q1-2026/27</option>
                  <option value="Q2-2026/27">Q2-2026/27</option>
                  <option value="Q3-2026/27">Q3-2026/27</option>
                  <option value="Q4-2026/27">Q4-2026/27</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => handleOpenCreate('Regular')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 14px',
                    background: '#15803d',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  New Invoice
                </button>
              </div>
            </div>

            {/* Entries Display: Mobile Cards or Desktop Table */}
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {entriesLoading ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={16} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                    Loading HCPPL invoices...
                  </div>
                ) : entries.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                    No records match the current filters. Click "+ New Invoice" to enter data.
                  </div>
                ) : (
                  entries.map((item, idx) => {
                    const isRt = item.status === 'RT' || item.salesType === 'RT';
                    return (
                      <div key={item.id || idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', marginRight: '6px' }}>#{item.srNo}</span>
                            <strong style={{ fontSize: '14px', color: '#0369a1' }}>{item.invoiceNumber}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              style={{ padding: '4px 8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', color: '#2563eb', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(item)}
                              style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#dc2626', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: isRt ? '#ede9fe' : '#dcfce7', color: isRt ? '#7c3aed' : '#15803d' }}>
                            {isRt ? 'RT' : 'UNPAID'}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: '#e0f2fe', color: '#0369a1' }}>
                            {item.quarter}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: '#f1f5f9', color: '#475569' }}>
                            {item.ageingBucket}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>{item.companyName}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#f8fafc', padding: '8px', borderRadius: '6px', fontSize: '11px' }}>
                          <div><span style={{ color: '#64748b' }}>Inv Amt: </span><strong>{formatCurrency(item.invoiceAmount)}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Outstanding: </span><strong style={{ color: '#dc2626' }}>{formatCurrency(item.outstanding)}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Date: </span>{formatDate(item.invoiceDate)}</div>
                          <div><span style={{ color: '#64748b' }}>Due: </span>{formatDate(item.dueDate)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Desktop Entries Table */
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <tr>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', width: '80px', borderRight: '1px solid #e2e8f0' }}>Actions</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Sr No</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Invoice No</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Date</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Section</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Company Name</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>Basic Amt</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>Inv Amount</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>Amt Rcvd</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>Outstanding</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Quarter</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Due Date</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ageing</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155' }}>Ageing Bucket</th>
                    </tr>
                  </thead>

                  <tbody>
                    {entriesLoading ? (
                      <tr>
                        <td colSpan={14} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                          <RefreshCw size={16} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                          Loading HCPPL invoices...
                        </td>
                      </tr>
                    ) : entries.length === 0 ? (
                      <tr>
                        <td colSpan={14} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                          No records match the current filters. Click "+ New Invoice" to enter data.
                        </td>
                      </tr>
                    ) : (
                      entries.map((item, idx) => {
                        const isRt = item.status === 'RT' || item.salesType === 'RT';
                        return (
                          <tr
                            key={item.id || idx}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: idx % 2 === 0 ? '#fff' : '#f8fafc'
                            }}
                          >
                            {/* Actions */}
                            <td style={{ padding: '6px 10px', borderRight: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  title="Edit Record"
                                  style={{
                                    padding: '3px 6px',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '4px',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(item)}
                                  title="Delete Record"
                                  style={{
                                    padding: '3px 6px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>

                            <td style={{ padding: '8px 12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{item.srNo}</td>
                            <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0369a1', borderRight: '1px solid #f1f5f9' }}>{item.invoiceNumber}</td>
                            <td style={{ padding: '8px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{formatDate(item.invoiceDate)}</td>
                            <td style={{ padding: '8px 12px', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '700',
                                background: isRt ? '#ede9fe' : '#dcfce7',
                                color: isRt ? '#7c3aed' : '#15803d'
                              }}>
                                {isRt ? 'RT' : 'UNPAID'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>{item.companyName}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569', borderRight: '1px solid #f1f5f9' }}>{formatCurrency(item.basicAmount)}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>{formatCurrency(item.invoiceAmount)}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#16a34a', borderRight: '1px solid #f1f5f9' }}>{formatCurrency(item.amtRcvd)}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '800', color: Number(item.outstanding) > 0 ? '#dc2626' : '#16a34a', borderRight: '1px solid #f1f5f9' }}>
                              {formatCurrency(item.outstanding)}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0369a1', borderRight: '1px solid #f1f5f9' }}>{item.quarter}</td>
                            <td style={{ padding: '8px 12px', color: '#475569', borderRight: '1px solid #f1f5f9' }}>{formatDate(item.dueDate)}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700', color: item.ageingDays > 0 ? '#dc2626' : '#16a34a', borderRight: '1px solid #f1f5f9' }}>
                              {item.ageingDays}d
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: '600',
                                background: item.ageingBucket === 'Yet To Due' ? '#f1f5f9' : '#fee2e2',
                                color: item.ageingBucket === 'Yet To Due' ? '#475569' : '#b91c1c'
                              }}>
                                {item.ageingBucket}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <div>
                Showing {entries.length > 0 ? (entryPagination.page - 1) * entryPagination.limit + 1 : 0} to{' '}
                {Math.min(entryPagination.page * entryPagination.limit, entryPagination.totalItems)} of {entryPagination.totalItems} records
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  disabled={entryPagination.page <= 1}
                  onClick={() => setEntryPagination(p => ({ ...p, page: p.page - 1 }))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: entryPagination.page <= 1 ? '#f1f5f9' : '#fff',
                    cursor: entryPagination.page <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                <span style={{ padding: '0 6px', fontWeight: '600' }}>
                  Page {entryPagination.page} of {entryPagination.totalPages || 1}
                </span>

                <button
                  disabled={entryPagination.page >= entryPagination.totalPages}
                  onClick={() => setEntryPagination(p => ({ ...p, page: p.page + 1 }))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: entryPagination.page >= entryPagination.totalPages ? '#f1f5f9' : '#fff',
                    cursor: entryPagination.page >= entryPagination.totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Data Entry Modal (Add / Edit HCPPL Invoice) */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '8px' : '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '780px',
            maxHeight: isMobile ? '96vh' : '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            padding: isMobile ? '16px 14px' : '28px'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              marginBottom: '20px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '14px',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', background: '#dcfce7', borderRadius: '6px', color: '#15803d' }}>
                  <TableProperties size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {modalMode === 'create' ? 'Add New HCPPL AR Record' : `Edit HCPPL Record: ${formData.invoiceNumber}`}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Data entered here automatically feeds the Unpaid & RT summary matrices
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', alignSelf: isMobile ? 'flex-end' : 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '18px', fontSize: '13px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm}>
              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {/* Invoice Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Invoice Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer Company"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Section / Type (Unpaid vs RT) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    Target Matrix / Section *
                  </label>
                  <select
                    value={formData.salesType === 'RT' || formData.status === 'RT' ? 'RT' : 'Regular'}
                    onChange={(e) => {
                      const isRt = e.target.value === 'RT';
                      setFormData({
                        ...formData,
                        salesType: isRt ? 'RT' : 'Regular',
                        status: isRt ? 'RT' : (formData.status === 'RT' ? 'UNPAID' : formData.status)
                      });
                    }}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '2px solid #16a34a', background: '#f0fdf4', fontWeight: '600' }}
                  >
                    <option value="Regular">Section 1 — Unpaid Matrix</option>
                    <option value="RT">Section 2 — RT (Retention) Matrix</option>
                  </select>
                </div>

                {/* Basic Amount */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Basic Amount (W/O Cartage & GST) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.basicAmount}
                    onChange={(e) => setFormData({ ...formData, basicAmount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Invoice Amount */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                      Invoice Amount (Total with GST) *
                    </label>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                      Manual Input
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter total invoice amount with GST..."
                    value={formData.invoiceAmount}
                    onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Sales Person */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Sales Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MTH, RT, TL"
                    value={formData.salesPerson}
                    onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Payment Term (Days) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Payment Term (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paymentTermDays}
                    onChange={(e) => setFormData({ ...formData, paymentTermDays: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Amount Received */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Amount Received
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amtRcvd}
                    onChange={(e) => setFormData({ ...formData, amtRcvd: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Remarks */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Optional remarks or retention notes..."
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Real-time System-Controlled Calculation Preview */}
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#0369a1', fontSize: '12px', fontWeight: '700' }}>
                  <Calculator size={15} />
                  System-Controlled Calculations (Automatic Matrix Inputs)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Due Date:</span>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{formatDate(formPreview.dueDate)}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Fiscal Quarter:</span>
                    <div style={{ fontWeight: '700', color: '#0284c7' }}>{formPreview.quarter}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Net Outstanding:</span>
                    <div style={{ fontWeight: '700', color: formPreview.outstanding > 0 ? '#dc2626' : '#16a34a' }}>
                      {formatCurrency(formPreview.outstanding)}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Ageing (Days):</span>
                    <div style={{ fontWeight: '700', color: formPreview.ageingDays > 0 ? '#ea580c' : '#16a34a' }}>
                      {formPreview.ageingDays} Days
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b' }}>Ageing Bucket:</span>
                    <div style={{ fontWeight: '700', color: '#4338ca' }}>{formPreview.ageingBucket}</div>
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                  * This entry will automatically reflect in the {formData.salesType === 'RT' ? 'Section 2 (RT)' : 'Section 1 (Unpaid)'} matrix under column {formPreview.quarter} and row {formPreview.ageingBucket}.
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px',
                flexDirection: isMobile ? 'column-reverse' : 'row'
              }}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: isMobile ? '10px 18px' : '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: isMobile ? '10px 20px' : '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create Entry' : 'Update Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

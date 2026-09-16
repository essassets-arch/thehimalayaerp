'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  MapPin,
  User,
  SlidersHorizontal,
  X,
  Plus,
  Edit2,
  Save,
  Calculator,
  Table,
  LayoutList,
  List
} from 'lucide-react';
import {
  fetchApplArRegister,
  createApplArInvoice,
  updateApplArInvoice,
  deleteApplArInvoice
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

// System calculation helper for auto-calculating & previewing values
function computeSystemCalculations(invoiceDateStr, termDaysNum, invAmtNum, rcvdAmtNum, currentStatus) {
  const invDate = invoiceDateStr ? new Date(invoiceDateStr) : new Date();
  const termDays = Number(termDaysNum) || 30;
  const dueDateObj = new Date(invDate.getTime() + termDays * 24 * 60 * 60 * 1000);
  const dueDate = !isNaN(dueDateObj.getTime()) ? dueDateObj.toISOString().split('T')[0] : '';

  // Quarter
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
  let ageingDays = 0;
  let ageingBucket = 'Yet To Due';

  if (currentStatus === 'PAID' || (outstanding <= 0 && rcvdAmt > 0)) {
    ageingDays = 0;
    ageingBucket = 'Paid / Settled';
  } else if (dueDateObj && !isNaN(dueDateObj.getTime())) {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      ageingDays = diffDays;
      if (diffDays <= 30) ageingBucket = '1-30 Days';
      else if (diffDays <= 45) ageingBucket = '31-45 Days';
      else if (diffDays <= 60) ageingBucket = '46-60 Days';
      else if (diffDays <= 90) ageingBucket = '61-90 Days';
      else if (diffDays <= 120) ageingBucket = '91-120 Days';
      else ageingBucket = 'More than 120 Days';
    } else {
      ageingDays = 0;
      ageingBucket = 'Yet To Due';
    }
  }

  return { dueDate, quarter, outstanding, ageingDays, ageingBucket };
}
const calculatePreview = computeSystemCalculations;

export default function BackOfficeApplAr() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    basicAmount: 0,
    invoiceAmount: 0,
    amtRcvd: 0,
    outstanding: 0,
    count: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    quarters: [],
    salesPersons: [],
    statuses: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalItems: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Responsive & View Mode State ('auto' | 'table' | 'list')
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState('auto');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeView = viewMode === 'auto' ? (isMobile ? 'list' : 'table') : viewMode;

  // Filter States
  const [search, setSearch] = useState('');
  const [quarter, setQuarter] = useState('ALL');
  const [ageingBucket, setAgeingBucket] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [salesPerson, setSalesPerson] = useState('ALL');
  const [salesType, setSalesType] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('srNo');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal / Data Entry State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeItem, setActiveItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    srNo: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    basicAmount: '',
    invoiceAmount: '',
    companyName: '',
    siteName: '',
    city: 'Ahmedabad',
    salesType: 'Regular',
    salesPerson: '',
    paymentTermDays: 30,
    dueDate: '',
    ageingDays: 0,
    ageingBucket: 'Yet To Due',
    status: 'UNPAID',
    amtRcvd: 0,
    amtRcvdDate: '',
    completePaymentDate: '',
    outstanding: 0,
    remarks: '',
    quarter: ''
  });

  const ageingBuckets = [
    'Yet To Due',
    '1-30 Days',
    '31-45 Days',
    '46-60 Days',
    '61-90 Days',
    '91-120 Days',
    'More than 120 Days',
    'Paid / Settled'
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApplArRegister({
        search,
        quarter,
        ageingBucket,
        status,
        salesPerson,
        salesType,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit
      });

      if (res) {
        setData(res.items || []);
        if (res.totals) setTotals(res.totals);
        if (res.pagination) setPagination(res.pagination);
        if (res.filterOptions) setFilterOptions(res.filterOptions);
      }
    } catch (err) {
      console.error('Failed to fetch APPL AR sheet:', err);
      setError('Unable to load APPL AR Register from backend. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, [search, quarter, ageingBucket, status, salesPerson, salesType, dateFrom, dateTo, sortBy, sortOrder, pagination.page, pagination.limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal (all 21 fields initialized with intelligent defaults)
  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveItem(null);
    setFormError(null);
    const invDateStr = new Date().toISOString().split('T')[0];
    const defs = computeSystemCalculations(invDateStr, 30, 0, 0, 'UNPAID');
    const nextSrNo = (totals.count || pagination.totalItems || data.length || 0) + 1;

    setFormData({
      srNo: nextSrNo,
      invoiceNumber: `APPL/2627/${String(nextSrNo).padStart(4, '0')}`,
      invoiceDate: invDateStr,
      basicAmount: '',
      invoiceAmount: '',
      companyName: '',
      siteName: '',
      city: 'Ahmedabad',
      salesType: 'Regular',
      salesPerson: '',
      paymentTermDays: 30,
      dueDate: defs.dueDate,
      ageingDays: defs.ageingDays,
      ageingBucket: defs.ageingBucket,
      status: 'UNPAID',
      amtRcvd: 0,
      amtRcvdDate: '',
      completePaymentDate: '',
      outstanding: defs.outstanding,
      remarks: '',
      quarter: defs.quarter
    });
    setModalOpen(true);
  };

  // Open Edit Modal (loads all 21 fields, completely writable)
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setActiveItem(item);
    setFormError(null);
    setFormData({
      srNo: item.srNo !== undefined && item.srNo !== null ? item.srNo : '',
      invoiceNumber: item.invoiceNo || '',
      invoiceDate: item.invoiceDate ? new Date(item.invoiceDate).toISOString().split('T')[0] : '',
      basicAmount: item.basicAmount !== undefined ? item.basicAmount : '',
      invoiceAmount: item.invoiceAmount !== undefined ? item.invoiceAmount : '',
      companyName: item.companyName || '',
      siteName: item.siteName === '-' ? '' : (item.siteName || ''),
      city: item.city === '-' ? '' : (item.city || ''),
      salesType: item.salesType || 'Regular',
      salesPerson: item.salesPerson === '-' ? '' : (item.salesPerson || ''),
      paymentTermDays: item.paymentTermDays !== undefined ? item.paymentTermDays : 30,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
      ageingDays: item.ageingDays !== undefined && item.ageingDays !== null ? item.ageingDays : 0,
      ageingBucket: item.ageingBucket || 'Yet To Due',
      status: item.status || 'UNPAID',
      amtRcvd: item.amtRcvd !== undefined ? item.amtRcvd : 0,
      amtRcvdDate: item.amtRcvdDate ? new Date(item.amtRcvdDate).toISOString().split('T')[0] : '',
      completePaymentDate: item.completePaymentDate ? new Date(item.completePaymentDate).toISOString().split('T')[0] : '',
      outstanding: item.outstanding !== undefined ? item.outstanding : 0,
      remarks: item.remarks || '',
      quarter: item.quarter || ''
    });
    setModalOpen(true);
  };

  // Auto-calculation & smart defaults while allowing full manual overwrite on all 21 fields
  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'basicAmount') {
        // Basic Amount is kept independent; Invoice Amount is manually entered
      }

      if (field === 'invoiceAmount') {
        const inv = Number(value) || 0;
        const rcvd = Number(prev.amtRcvd) || 0;
        updated.outstanding = Number((inv - rcvd).toFixed(2));
        if (updated.outstanding <= 0 && rcvd > 0 && prev.status !== 'RT') {
          updated.status = 'PAID';
          updated.ageingDays = 0;
          updated.ageingBucket = 'Paid / Settled';
        }
      }

      if (field === 'amtRcvd') {
        const rcvd = Number(value) || 0;
        const inv = Number(prev.invoiceAmount) || 0;
        updated.outstanding = Number((inv - rcvd).toFixed(2));
        if (rcvd > 0 && !prev.amtRcvdDate) {
          updated.amtRcvdDate = new Date().toISOString().split('T')[0];
        }
        if (updated.outstanding <= 0 && rcvd > 0 && prev.status !== 'RT') {
          updated.status = 'PAID';
          if (!prev.completePaymentDate) {
            updated.completePaymentDate = new Date().toISOString().split('T')[0];
          }
          updated.ageingDays = 0;
          updated.ageingBucket = 'Paid / Settled';
        }
      }

      if (field === 'invoiceDate') {
        const invDate = new Date(value);
        if (!isNaN(invDate.getTime())) {
          const term = Number(prev.paymentTermDays) || 30;
          const due = new Date(invDate.getTime() + term * 24 * 60 * 60 * 1000);
          updated.dueDate = due.toISOString().split('T')[0];

          // Quarter
          const m = invDate.getMonth();
          const y = invDate.getFullYear();
          let qNum, sYear, eYear;
          if (m >= 3 && m <= 5) { qNum = 1; sYear = y; eYear = y + 1; }
          else if (m >= 6 && m <= 8) { qNum = 2; sYear = y; eYear = y + 1; }
          else if (m >= 9 && m <= 11) { qNum = 3; sYear = y; eYear = y + 1; }
          else { qNum = 4; sYear = y - 1; eYear = y; }
          updated.quarter = `Q${qNum}-${sYear}/${String(eYear).slice(-2)}`;

          // Ageing
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
          if (updated.status === 'PAID') {
            updated.ageingDays = 0;
            updated.ageingBucket = 'Paid / Settled';
          } else if (diffDays > 0) {
            updated.ageingDays = diffDays;
            if (diffDays <= 30) updated.ageingBucket = '1-30 Days';
            else if (diffDays <= 45) updated.ageingBucket = '31-45 Days';
            else if (diffDays <= 60) updated.ageingBucket = '46-60 Days';
            else if (diffDays <= 90) updated.ageingBucket = '61-90 Days';
            else if (diffDays <= 120) updated.ageingBucket = '91-120 Days';
            else updated.ageingBucket = 'More than 120 Days';
          } else {
            updated.ageingDays = 0;
            updated.ageingBucket = 'Yet To Due';
          }
        }
      }

      if (field === 'paymentTermDays') {
        const invDateStr = prev.invoiceDate || new Date().toISOString().split('T')[0];
        const invDate = new Date(invDateStr);
        const term = Number(value) || 0;
        if (!isNaN(invDate.getTime())) {
          const due = new Date(invDate.getTime() + term * 24 * 60 * 60 * 1000);
          updated.dueDate = due.toISOString().split('T')[0];

          const now = new Date();
          const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
          if (updated.status !== 'PAID') {
            if (diffDays > 0) {
              updated.ageingDays = diffDays;
              if (diffDays <= 30) updated.ageingBucket = '1-30 Days';
              else if (diffDays <= 45) updated.ageingBucket = '31-45 Days';
              else if (diffDays <= 60) updated.ageingBucket = '46-60 Days';
              else if (diffDays <= 90) updated.ageingBucket = '61-90 Days';
              else if (diffDays <= 120) updated.ageingBucket = '91-120 Days';
              else updated.ageingBucket = 'More than 120 Days';
            } else {
              updated.ageingDays = 0;
              updated.ageingBucket = 'Yet To Due';
            }
          }
        }
      }

      if (field === 'dueDate' && value) {
        const due = new Date(value);
        if (!isNaN(due.getTime()) && updated.status !== 'PAID') {
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            updated.ageingDays = diffDays;
            if (diffDays <= 30) updated.ageingBucket = '1-30 Days';
            else if (diffDays <= 45) updated.ageingBucket = '31-45 Days';
            else if (diffDays <= 60) updated.ageingBucket = '46-60 Days';
            else if (diffDays <= 90) updated.ageingBucket = '61-90 Days';
            else if (diffDays <= 120) updated.ageingBucket = '91-120 Days';
            else updated.ageingBucket = 'More than 120 Days';
          } else {
            updated.ageingDays = 0;
            updated.ageingBucket = 'Yet To Due';
          }
        }
      }

      if (field === 'salesType' && value === 'RT') {
        updated.status = 'RT';
      }

      return updated;
    });
  };

  const handleAutoFillCalculations = () => {
    const calc = computeSystemCalculations(
      formData.invoiceDate,
      formData.paymentTermDays,
      formData.invoiceAmount || formData.basicAmount,
      formData.amtRcvd,
      formData.status
    );
    setFormData(prev => ({
      ...prev,
      dueDate: calc.dueDate,
      quarter: calc.quarter,
      outstanding: calc.outstanding,
      ageingDays: calc.ageingDays,
      ageingBucket: calc.ageingBucket
    }));
  };

  // Save Form (Create or Update with all 21 fields)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !String(formData.invoiceNumber).trim()) {
      setFormError('Invoice Number is required.');
      return;
    }
    if (!formData.companyName || !String(formData.companyName).trim()) {
      setFormError('Company Name is required.');
      return;
    }
    if (formData.basicAmount === '' || isNaN(Number(formData.basicAmount)) || Number(formData.basicAmount) < 0) {
      setFormError('Please enter a valid Basic Amount (>= 0).');
      return;
    }
    if (formData.invoiceAmount === '' || isNaN(Number(formData.invoiceAmount)) || Number(formData.invoiceAmount) < 0) {
      setFormError('Please enter a valid Invoice Amount (>= 0).');
      return;
    }
    if (!formData.invoiceDate) {
      setFormError('Invoice Date is required.');
      return;
    }
    if (!formData.dueDate) {
      setFormError('Due Date is required.');
      return;
    }
    if (!formData.quarter || !String(formData.quarter).trim()) {
      setFormError('Quarter is required (e.g. Q2-2026/27).');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        srNo: formData.srNo !== '' && formData.srNo !== null && !isNaN(Number(formData.srNo)) ? Number(formData.srNo) : undefined,
        invoiceNumber: String(formData.invoiceNumber).trim(),
        invoiceDate: formData.invoiceDate,
        basicAmount: Number(formData.basicAmount),
        invoiceAmount: Number(formData.invoiceAmount),
        companyName: String(formData.companyName).trim(),
        siteName: formData.siteName ? String(formData.siteName).trim() : '',
        city: formData.city ? String(formData.city).trim() : '',
        salesType: formData.salesType || 'Regular',
        salesPerson: formData.salesPerson ? String(formData.salesPerson).trim() : '',
        paymentTermDays: Number(formData.paymentTermDays) || 0,
        dueDate: formData.dueDate,
        ageingDays: Number(formData.ageingDays) || 0,
        ageingBucket: formData.ageingBucket || 'Yet To Due',
        status: formData.status || 'UNPAID',
        amtRcvd: Number(formData.amtRcvd) || 0,
        amtRcvdDate: formData.amtRcvdDate || null,
        completePaymentDate: formData.completePaymentDate || null,
        outstanding: Number(formData.outstanding) || 0,
        remarks: formData.remarks ? String(formData.remarks).trim() : '',
        quarter: String(formData.quarter).trim()
      };

      if (modalMode === 'create') {
        await createApplArInvoice(payload);
      } else {
        await updateApplArInvoice(activeItem.id, payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save invoice entry:', err);
      setFormError(err.message || 'Error saving invoice record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Column header sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setQuarter('ALL');
    setAgeingBucket('ALL');
    setStatus('ALL');
    setSalesPerson('ALL');
    setSalesType('ALL');
    setDateFrom('');
    setDateTo('');
    setSortBy('srNo');
    setSortOrder('asc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Preview calculations for the modal
  const formPreview = useMemo(() => {
    return calculatePreview(
      formData.invoiceDate,
      formData.paymentTermDays,
      formData.invoiceAmount || formData.basicAmount,
      formData.amtRcvd
    );
  }, [formData.invoiceDate, formData.paymentTermDays, formData.invoiceAmount, formData.basicAmount, formData.amtRcvd]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!data.length) return;
    const headers = [
      'Sr No.',
      'Invoice No',
      'Invoice Date',
      'Basic Amount',
      'Invoice Amount',
      'Company Name',
      'Site Name',
      'City',
      'Sales Type',
      'Sales Person',
      'Payment Term (Days)',
      'Due Date',
      'Ageing (Days)',
      'Ageing Bucket',
      'Status',
      'Amt Rcvd',
      'Amt Rcvd Date',
      'Complete Payment Date',
      'Outstanding',
      'Remarks',
      'Quarter'
    ];

    const rows = data.map(item => [
      item.srNo,
      `"${item.invoiceNo}"`,
      formatDate(item.invoiceDate),
      item.basicAmount,
      item.invoiceAmount,
      `"${item.companyName}"`,
      `"${item.siteName}"`,
      `"${item.city}"`,
      `"${item.salesType}"`,
      `"${item.salesPerson}"`,
      item.paymentTermDays,
      formatDate(item.dueDate),
      item.ageingDays,
      `"${item.ageingBucket}"`,
      `"${item.status}"`,
      item.amtRcvd,
      formatDate(item.amtRcvdDate),
      formatDate(item.completePaymentDate),
      item.outstanding,
      `"${(item.remarks || '').replace(/"/g, '""')}"`,
      `"${item.quarter}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `APPL_AR_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: isMobile ? '12px 12px 28px' : '24px 32px', maxWidth: '100%', minHeight: '100vh', background: '#f8fafc', overflowX: 'hidden' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px', background: '#3b82f6', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={isMobile ? 18 : 22} />
            </div>
            <h1 style={{ fontSize: isMobile ? '19px' : '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              APPL AR — Invoice Register
            </h1>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>
              OPERATOR DATA ENTRY
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Accounts receivable row-by-row data sheet • Enter, maintain and track APPL invoices
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {/* Segmented View Switcher: List View / Table View */}
          <div style={{
            display: 'inline-flex',
            background: '#e2e8f0',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
            flex: isMobile ? '1 1 auto' : 'none',
            justifyContent: 'center'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: activeView === 'list' ? '#2563eb' : 'transparent',
                color: activeView === 'list' ? '#fff' : '#475569',
                cursor: 'pointer',
                boxShadow: activeView === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <LayoutList size={14} />
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: activeView === 'table' ? '#2563eb' : 'transparent',
                color: activeView === 'table' ? '#fff' : '#475569',
                cursor: 'pointer',
                boxShadow: activeView === 'table' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Table size={14} />
              Table View
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '8px 14px' : '9px 16px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              flex: isMobile ? '1 1 auto' : 'none'
            }}
          >
            <Plus size={16} />
            Add Invoice
          </button>

          <button
            onClick={loadData}
            title="Refresh register"
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
            title="Export CSV"
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

      {/* 2. KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: isMobile ? '10px' : '16px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#fff', padding: isMobile ? '12px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Invoices</div>
          <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#0f172a' }}>{totals.count}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Filtered rows</div>
        </div>

        <div style={{ background: '#fff', padding: isMobile ? '12px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Basic (w/o GST)</div>
          <div style={{ fontSize: isMobile ? '16px' : '22px', fontWeight: '800', color: '#2563eb' }}>{formatCurrency(totals.basicAmount)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Excl cartage & GST</div>
        </div>

        <div style={{ background: '#fff', padding: isMobile ? '12px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Invoice Amount</div>
          <div style={{ fontSize: isMobile ? '16px' : '22px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(totals.invoiceAmount)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Gross billed</div>
        </div>

        <div style={{ background: '#fff', padding: isMobile ? '12px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase', marginBottom: '4px' }}>Amt Received</div>
          <div style={{ fontSize: isMobile ? '16px' : '22px', fontWeight: '800', color: '#16a34a' }}>{formatCurrency(totals.amtRcvd)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Collections</div>
        </div>

        <div style={{
          background: '#fff',
          padding: isMobile ? '12px' : '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderLeft: '4px solid #ef4444',
          gridColumn: isMobile ? 'span 2' : 'auto'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', textTransform: 'uppercase', marginBottom: '4px' }}>Total Outstanding</div>
          <div style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '800', color: '#dc2626' }}>{formatCurrency(totals.outstanding)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Net pending recovery</div>
        </div>
      </div>

      {/* 3. Advanced Filter Bar */}
      <div style={{ background: '#fff', padding: isMobile ? '12px' : '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: isMobile ? '10px' : '14px',
          alignItems: 'center'
        }}>
          {/* Search (Spans 2 columns on mobile) */}
          <div style={{ position: 'relative', gridColumn: isMobile ? 'span 2' : 'auto' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Invoice, Company, Site, City..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>

          {/* Quarter Filter */}
          <div>
            <select
              value={quarter}
              onChange={(e) => { setQuarter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
            >
              <option value="ALL">All Quarters</option>
              <option value="Q1-2026/27">Q1-2026/27</option>
              <option value="Q2-2026/27">Q2-2026/27</option>
              <option value="Q3-2026/27">Q3-2026/27</option>
              <option value="Q4-2026/27">Q4-2026/27</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="PAID">PAID</option>
              <option value="RT">RT (Retention)</option>
            </select>
          </div>

          {/* Ageing Bucket Filter */}
          <div>
            <select
              value={ageingBucket}
              onChange={(e) => { setAgeingBucket(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
            >
              <option value="ALL">All Ageing Buckets</option>
              {ageingBuckets.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Sales Person Filter */}
          <div>
            <select
              value={salesPerson}
              onChange={(e) => { setSalesPerson(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
            >
              <option value="ALL">All Sales Persons</option>
              {filterOptions.salesPersons.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Sales Type Filter */}
          <div>
            <select
              value={salesType}
              onChange={(e) => { setSalesType(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
            >
              <option value="ALL">All Sales Types</option>
              <option value="Regular">Regular</option>
              <option value="RT">RT</option>
              <option value="Project">Project</option>
              <option value="Trading">Trading</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div style={{ gridColumn: isMobile ? 'span 2' : 'auto' }}>
            <button
              onClick={handleResetFilters}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Mobile List View OR Desktop Table View */}
      {activeView === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 2px', fontSize: '12px', color: '#64748b' }}>
            <span>Showing <strong>{data.length}</strong> invoices in List View</span>
            <span style={{ fontSize: '11px' }}>Sort: <strong>{sortBy}</strong> ({sortOrder.toUpperCase()})</span>
          </div>

          {loading ? (
            <div style={{ background: '#fff', padding: '48px', textAlign: 'center', color: '#64748b', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} className="animate-spin" />
                Loading APPL AR Register...
              </div>
            </div>
          ) : data.length === 0 ? (
            <div style={{ background: '#fff', padding: '48px', textAlign: 'center', color: '#64748b', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              No invoices match your selected filters.
            </div>
          ) : (
            data.map((item, idx) => {
              const isOverdue = item.ageingDays > 0 && item.status !== 'PAID';
              return (
                <div
                  key={item.id || idx}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    padding: '16px',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    position: 'relative'
                  }}
                >
                  {/* Card Row 1: Sr No, Invoice No, Quarter & Edit Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#475569'
                      }}>
                        #{item.srNo}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7' }}>
                        {item.invoiceNo}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: '#e0f2fe',
                        color: '#0369a1'
                      }}>
                        {item.quarter}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                  </div>

                  {/* Card Row 2: Status, Sales Type & Ageing Bucket */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      background: item.status === 'PAID' ? '#dcfce7'
                        : item.status === 'PARTIAL' ? '#fef3c7'
                        : item.status === 'RT' ? '#ede9fe'
                        : '#fee2e2',
                      color: item.status === 'PAID' ? '#15803d'
                        : item.status === 'PARTIAL' ? '#b45309'
                        : item.status === 'RT' ? '#7c3aed'
                        : '#b91c1c'
                    }}>
                      {item.status}
                    </span>

                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: item.salesType === 'RT' ? '#f3e8ff' : '#f0f9ff',
                      color: item.salesType === 'RT' ? '#7e22ce' : '#0284c7'
                    }}>
                      {item.salesType}
                    </span>

                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: item.ageingBucket === 'Yet To Due' ? '#f1f5f9'
                        : item.ageingBucket === '1-30 Days' ? '#e0f2fe'
                        : item.ageingBucket === '31-45 Days' ? '#e0e7ff'
                        : item.ageingBucket === '46-60 Days' ? '#fef3c7'
                        : item.ageingBucket === '61-90 Days' ? '#ffedd5'
                        : '#fee2e2',
                      color: item.ageingBucket === 'Yet To Due' ? '#475569'
                        : item.ageingBucket === '1-30 Days' ? '#0369a1'
                        : item.ageingBucket === '31-45 Days' ? '#4338ca'
                        : item.ageingBucket === '46-60 Days' ? '#b45309'
                        : item.ageingBucket === '61-90 Days' ? '#c2410c'
                        : '#b91c1c'
                    }}>
                      {item.ageingBucket} {isOverdue ? `(${item.ageingDays}d overdue)` : ''}
                    </span>
                  </div>

                  {/* Card Row 3: Company, Site, City & Rep */}
                  <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                      <Building2 size={15} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span>{item.companyName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#475569' }}>
                      {item.siteName && item.siteName !== '-' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} style={{ color: '#94a3b8' }} />
                          Site: {item.siteName}
                        </span>
                      )}
                      {item.city && item.city !== '-' && (
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                          📍 {item.city}
                        </span>
                      )}
                      {item.salesPerson && item.salesPerson !== '-' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#64748b' }}>
                          <User size={12} style={{ color: '#94a3b8' }} />
                          Rep: <strong style={{ color: '#1e293b' }}>{item.salesPerson}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Row 4: Financial Metrics 2x2 Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Invoice Amount</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(item.invoiceAmount)}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Basic: {formatCurrency(item.basicAmount)}</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Outstanding</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: Number(item.outstanding) > 0 ? '#dc2626' : '#16a34a' }}>
                        {formatCurrency(item.outstanding)}
                      </div>
                      <div style={{ fontSize: '10px', color: Number(item.amtRcvd) > 0 ? '#16a34a' : '#94a3b8' }}>
                        Rcvd: {formatCurrency(item.amtRcvd)}
                      </div>
                    </div>
                  </div>

                  {/* Card Row 5: Dates & Payment Terms */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '6px',
                    fontSize: '11px',
                    color: '#64748b',
                    borderTop: '1px dashed #e2e8f0',
                    paddingTop: '8px'
                  }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Inv Date: </span>
                      <strong style={{ color: '#334155' }}>{formatDate(item.invoiceDate)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Due Date: </span>
                      <strong style={{ color: isOverdue ? '#dc2626' : '#334155' }}>
                        {formatDate(item.dueDate)}
                      </strong>
                      <span style={{ color: '#94a3b8', fontSize: '10px' }}> ({item.paymentTermDays}d)</span>
                    </div>
                    {item.amtRcvdDate && (
                      <div>
                        <span style={{ color: '#94a3b8' }}>Rcvd Date: </span>
                        <strong style={{ color: '#16a34a' }}>{formatDate(item.amtRcvdDate)}</strong>
                      </div>
                    )}
                    {item.completePaymentDate && (
                      <div>
                        <span style={{ color: '#94a3b8' }}>Settled: </span>
                        <strong style={{ color: '#15803d' }}>{formatDate(item.completePaymentDate)}</strong>
                      </div>
                    )}
                  </div>

                  {/* Card Row 6: Remarks */}
                  {item.remarks && (
                    <div style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#92400e'
                    }}>
                      <strong>Remarks: </strong>{item.remarks}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Detailed 21-Column Table View */
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ overflowX: 'auto', maxHeight: '680px', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 10, borderBottom: '2px solid #cbd5e1' }}>
                <tr>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: '#334155', width: '60px', borderRight: '1px solid #e2e8f0' }}>Action</th>
                  {[
                    { label: 'Sr No.', key: 'srNo' },
                    { label: 'Invoice No', key: 'invoiceNumber' },
                    { label: 'Invoice Date', key: 'invoiceDate' },
                    { label: 'Basic Amount (W/O Cartage & GST)', key: 'basicAmount', align: 'right' },
                    { label: 'Invoice Amount', key: 'invoiceAmount', align: 'right' },
                    { label: 'Company Name', key: 'companyName' },
                    { label: 'Site Name', key: 'siteName' },
                    { label: 'City', key: 'city' },
                    { label: 'Sales Type', key: 'salesType' },
                    { label: 'Sales Person', key: 'salesPerson' },
                    { label: 'Payment Term (Days)', key: 'paymentTermDays', align: 'center' },
                    { label: 'Due Date', key: 'dueDate' },
                    { label: 'Ageing (Days)', key: 'ageingDays', align: 'center' },
                    { label: 'Ageing Bucket', key: 'ageingBucket' },
                    { label: 'Status', key: 'status', align: 'center' },
                    { label: 'Amt Rcvd', key: 'amtRcvd', align: 'right' },
                    { label: 'Amt Rcvd Date', key: 'amtRcvdDate' },
                    { label: 'Complete Payment Date', key: 'completePaymentDate' },
                    { label: 'Outstanding', key: 'outstanding', align: 'right' },
                    { label: 'Remarks', key: 'remarks' },
                    { label: 'Quarter', key: 'quarter', align: 'center' }
                  ].map((col, idx) => (
                    <th
                      key={col.key || idx}
                      onClick={() => handleSort(col.key)}
                      style={{
                        padding: '12px 14px',
                        fontWeight: '700',
                        color: '#334155',
                        textAlign: col.align || 'left',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderRight: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {col.label}
                        <ArrowUpDown size={11} style={{ opacity: sortBy === col.key ? 1 : 0.3 }} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={22} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={18} className="animate-spin" />
                        Loading APPL AR Register...
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={22} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      No invoices match your selected filters.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => {
                    const isOverdue = item.ageingDays > 0 && item.status !== 'PAID';
                    return (
                      <tr
                        key={item.id || idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f8fafc'; }}
                      >
                        {/* Action: Edit button */}
                        <td style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Invoice Record"
                            style={{
                              padding: '4px 8px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '4px',
                              color: '#2563eb',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                        </td>

                        {/* 1. Sr No */}
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                          {item.srNo}
                        </td>

                        {/* 2. Invoice No */}
                        <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0284c7', borderRight: '1px solid #f1f5f9' }}>
                          {item.invoiceNo}
                        </td>

                        {/* 3. Invoice Date */}
                        <td style={{ padding: '10px 14px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                          {formatDate(item.invoiceDate)}
                        </td>

                        {/* 4. Basic Amount */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.basicAmount)}
                        </td>

                        {/* 5. Invoice Amount */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.invoiceAmount)}
                        </td>

                        {/* 6. Company Name */}
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                          {item.companyName}
                        </td>

                        {/* 7. Site Name */}
                        <td style={{ padding: '10px 14px', color: '#475569', borderRight: '1px solid #f1f5f9' }}>
                          {item.siteName}
                        </td>

                        {/* 8. City */}
                        <td style={{ padding: '10px 14px', color: '#475569', borderRight: '1px solid #f1f5f9' }}>
                          {item.city}
                        </td>

                        {/* 9. Sales Type */}
                        <td style={{ padding: '10px 14px', borderRight: '1px solid #f1f5f9' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: item.salesType === 'RT' ? '#ede9fe' : '#e0f2fe',
                            color: item.salesType === 'RT' ? '#6d28d9' : '#0369a1'
                          }}>
                            {item.salesType}
                          </span>
                        </td>

                        {/* 10. Sales Person */}
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                          {item.salesPerson}
                        </td>

                        {/* 11. Payment Term (Days) */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#475569', borderRight: '1px solid #f1f5f9' }}>
                          {item.paymentTermDays} Days
                        </td>

                        {/* 12. Due Date */}
                        <td style={{ padding: '10px 14px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                          {formatDate(item.dueDate)}
                        </td>

                        {/* 13. Ageing (Days) */}
                        <td style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontWeight: '700',
                          color: isOverdue ? '#dc2626' : '#16a34a',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          {item.ageingDays}
                        </td>

                        {/* 14. Ageing Bucket */}
                        <td style={{ padding: '10px 14px', borderRight: '1px solid #f1f5f9' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: item.ageingBucket === 'Yet To Due' ? '#f1f5f9'
                              : item.ageingBucket === '1-30 Days' ? '#e0f2fe'
                              : item.ageingBucket === '31-45 Days' ? '#e0e7ff'
                              : item.ageingBucket === '46-60 Days' ? '#fef3c7'
                              : item.ageingBucket === '61-90 Days' ? '#ffedd5'
                              : '#fee2e2',
                            color: item.ageingBucket === 'Yet To Due' ? '#475569'
                              : item.ageingBucket === '1-30 Days' ? '#0369a1'
                              : item.ageingBucket === '31-45 Days' ? '#4338ca'
                              : item.ageingBucket === '46-60 Days' ? '#b45309'
                              : item.ageingBucket === '61-90 Days' ? '#c2410c'
                              : '#b91c1c'
                          }}>
                            {item.ageingBucket}
                          </span>
                        </td>

                        {/* 15. Status */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: item.status === 'PAID' ? '#dcfce7'
                              : item.status === 'PARTIAL' ? '#fef3c7'
                              : item.status === 'RT' ? '#ede9fe'
                              : '#fee2e2',
                            color: item.status === 'PAID' ? '#15803d'
                              : item.status === 'PARTIAL' ? '#b45309'
                              : item.status === 'RT' ? '#7c3aed'
                              : '#b91c1c'
                          }}>
                            {item.status}
                          </span>
                        </td>

                        {/* 16. Amt Rcvd */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: '#16a34a', borderRight: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.amtRcvd)}
                        </td>

                        {/* 17. Amt Rcvd Date */}
                        <td style={{ padding: '10px 14px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                          {formatDate(item.amtRcvdDate)}
                        </td>

                        {/* 18. Complete Payment Date */}
                        <td style={{ padding: '10px 14px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                          {formatDate(item.completePaymentDate)}
                        </td>

                        {/* 19. Outstanding */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: Number(item.outstanding) > 0 ? '#dc2626' : '#16a34a', borderRight: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.outstanding)}
                        </td>

                        {/* 20. Remarks */}
                        <td style={{ padding: '10px 14px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', borderRight: '1px solid #f1f5f9' }}>
                          {item.remarks || '-'}
                        </td>

                        {/* 21. Quarter */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: '#0369a1' }}>
                          {item.quarter}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Footer Totals */}
              <tfoot style={{ background: '#f8fafc', fontWeight: '700', borderTop: '2px solid #cbd5e1' }}>
                <tr>
                  <td style={{ padding: '12px 14px' }}></td>
                  <td colSpan={3} style={{ padding: '12px 14px', color: '#0f172a' }}>
                    Total Filtered Summary ({totals.count} Invoices)
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#2563eb' }}>
                    {formatCurrency(totals.basicAmount)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>
                    {formatCurrency(totals.invoiceAmount)}
                  </td>
                  <td colSpan={10}></td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a' }}>
                    {formatCurrency(totals.amtRcvd)}
                  </td>
                  <td colSpan={2}></td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#dc2626' }}>
                    {formatCurrency(totals.outstanding)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 5. Shared Pagination Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '12px 16px' : '14px 20px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        background: '#fff',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Showing {data.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} entries
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Rows:</span>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
              style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: pagination.page <= 1 ? '#f1f5f9' : '#fff',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                color: pagination.page <= 1 ? '#94a3b8' : '#334155'
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: '600', color: '#334155' }}>
              {pagination.page} / {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: pagination.page >= pagination.totalPages ? '#f1f5f9' : '#fff',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                color: pagination.page >= pagination.totalPages ? '#94a3b8' : '#334155'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Data Entry Modal (Add / Edit) */}
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
            maxWidth: isMobile ? '100%' : '920px',
            maxHeight: isMobile ? '96vh' : '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            padding: isMobile ? '16px 14px' : '28px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              marginBottom: '16px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '14px',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {modalMode === 'create' ? 'Add New APPL Invoice' : `Edit Invoice: ${formData.invoiceNumber}`}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                    All 21 APPL register columns are directly writable.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleAutoFillCalculations}
                  title="Auto-calculate Due Date, Quarter, Net Outstanding, Ageing"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    cursor: 'pointer'
                  }}
                >
                  <Calculator size={14} />
                  Auto-Fill
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {formError && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '18px', fontSize: '13px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm}>
              {/* SECTION 1: INVOICE IDENTIFICATION */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                  1. Invoice Identification & Date
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* 1. Sr No. */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Sr No. *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.srNo}
                      onChange={(e) => handleFieldChange('srNo', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 2. Invoice No */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Invoice No *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.invoiceNumber}
                      onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 3. Invoice Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Invoice Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.invoiceDate}
                      onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 21. Quarter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Quarter *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q2-2026/27"
                      value={formData.quarter}
                      onChange={(e) => handleFieldChange('quarter', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOMER & SALES ATTRIBUTION */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                  2. Customer & Sales Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* 6. Company Name */}
                  <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Customer / Company Name"
                      value={formData.companyName}
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 7. Site Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Site Name
                    </label>
                    <input
                      type="text"
                      placeholder="Site or Project"
                      value={formData.siteName}
                      onChange={(e) => handleFieldChange('siteName', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 8. City */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ahmedabad"
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 9. Sales Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Sales Type
                    </label>
                    <select
                      value={formData.salesType}
                      onChange={(e) => handleFieldChange('salesType', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option value="Regular">Regular</option>
                      <option value="RT">RT (Retention)</option>
                      <option value="Project">Project</option>
                      <option value="Trading">Trading</option>
                    </select>
                  </div>

                  {/* 10. Sales Person */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Sales Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MTH, RT, TL, SS1"
                      value={formData.salesPerson}
                      onChange={(e) => handleFieldChange('salesPerson', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: AMOUNTS, TERMS & DUE DATES */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                  3. Commercial Amounts & Payment Schedule
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* 4. Basic Amount (W/O Cartage & GST) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Basic Amount (W/O Cartage & GST) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.basicAmount}
                      onChange={(e) => handleFieldChange('basicAmount', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 5. Invoice Amount (Total with GST) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Invoice Amount (Total with GST) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.invoiceAmount}
                      onChange={(e) => handleFieldChange('invoiceAmount', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 11. Payment Term (Days) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Payment Term (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.paymentTermDays}
                      onChange={(e) => handleFieldChange('paymentTermDays', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 12. Due Date (Writable) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 19. Outstanding (Writable) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Outstanding *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.outstanding}
                      onChange={(e) => handleFieldChange('outstanding', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600', color: Number(formData.outstanding) > 0 ? '#b91c1c' : '#15803d' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: RECEIVABLES, AGEING & REMARKS */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                  4. Receipts, Status, Ageing & Remarks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* 15. Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PAID">PAID</option>
                      <option value="RT">RT (Retention)</option>
                    </select>
                  </div>

                  {/* 16. Amt Rcvd */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Amt Rcvd
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amtRcvd}
                      onChange={(e) => handleFieldChange('amtRcvd', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 17. Amt Rcvd Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Amt Rcvd Date
                    </label>
                    <input
                      type="date"
                      value={formData.amtRcvdDate}
                      onChange={(e) => handleFieldChange('amtRcvdDate', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 18. Complete Payment Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Complete Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.completePaymentDate}
                      onChange={(e) => handleFieldChange('completePaymentDate', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 13. Ageing (Days) (Writable) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Ageing (Days) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ageingDays}
                      onChange={(e) => handleFieldChange('ageingDays', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* 14. Ageing Bucket (Writable) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Ageing Bucket *
                    </label>
                    <select
                      value={formData.ageingBucket}
                      onChange={(e) => handleFieldChange('ageingBucket', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      {ageingBuckets.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* 20. Remarks */}
                  <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={formData.remarks}
                      onChange={(e) => handleFieldChange('remarks', e.target.value)}
                      placeholder="Optional remarks or notes..."
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                    />
                  </div>
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
                    padding: isMobile ? '10px 18px' : '8px 18px',
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
                    padding: isMobile ? '10px 22px' : '8px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
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

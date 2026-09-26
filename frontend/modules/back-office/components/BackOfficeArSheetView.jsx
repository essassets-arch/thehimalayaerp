'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Eye,
  Search,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  MapPin,
  User,
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Calculator,
  Table,
  LayoutList,
  Check,
  RotateCcw,
  Filter,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

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

export const AR_COLUMNS = [
  { key: 'srNo', label: 'Sr No.', align: 'left', minWidth: '70px' },
  { key: 'invoiceNo', label: 'Invoice No', align: 'left', minWidth: '140px' },
  { key: 'invoiceDate', label: 'Invoice Date', align: 'left', minWidth: '110px' },
  { key: 'basicAmount', label: 'Basic Amount (W/O Cartage and GST)', align: 'right', minWidth: '160px' },
  { key: 'invoiceAmount', label: 'Invoice Amount', align: 'right', minWidth: '140px' },
  { key: 'companyName', label: 'Company name', align: 'left', minWidth: '180px' },
  { key: 'siteName', label: 'Site Name', align: 'left', minWidth: '140px' },
  { key: 'city', label: 'City', align: 'left', minWidth: '110px' },
  { key: 'salesType', label: 'Sales Type', align: 'left', minWidth: '110px' },
  { key: 'salesPerson', label: 'Sales Person', align: 'left', minWidth: '130px' },
  { key: 'paymentTermDays', label: 'Payment Term (Days)', align: 'center', minWidth: '120px' },
  { key: 'dueDate', label: 'Due Date', align: 'left', minWidth: '110px' },
  { key: 'ageingDays', label: 'Ageing (Days)', align: 'center', minWidth: '110px' },
  { key: 'ageingBucket', label: 'Ageing Bucket', align: 'left', minWidth: '130px' },
  { key: 'status', label: 'Status', align: 'center', minWidth: '110px' },
  { key: 'amtRcvd', label: 'Amt Rcvd', align: 'right', minWidth: '130px' },
  { key: 'amtRcvdDate', label: 'Amt Rcvd Date', align: 'left', minWidth: '120px' },
  { key: 'completePaymentDate', label: 'Complete Payment Date', align: 'left', minWidth: '140px' },
  { key: 'outstanding', label: 'Outstanding', align: 'right', minWidth: '140px' },
  { key: 'remarks', label: 'Remarks', align: 'left', minWidth: '160px' },
  { key: 'quarter', label: 'Quarter', align: 'center', minWidth: '120px' },
];

export default function BackOfficeArSheetView({
  entity = 'APPL',
  sheetTitle = 'APPL Sheet',
  subtitle = 'Accounts Receivable 21-Column Register',
  invoicePrefix = 'APPL/2627/',
  fetchRegister,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  brandColor = '#0284c7',
  brandBg = '#e0f2fe'
}) {
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
  const [successToast, setSuccessToast] = useState(null);

  // Responsive & View Mode State ('auto' | 'table' | 'list')
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState('auto');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
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

  // Count active filters (excluding search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (quarter !== 'ALL') count++;
    if (ageingBucket !== 'ALL') count++;
    if (status !== 'ALL') count++;
    if (salesPerson !== 'ALL') count++;
    if (salesType !== 'ALL') count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  }, [quarter, ageingBucket, status, salesPerson, salesType, dateFrom, dateTo]);

    // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const handleOpenView = (item) => {
    setViewItem(item);
    setViewModalOpen(true);
  };

  // Modal / Data Entry State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeItem, setActiveItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const toggleCardExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRegister({
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
      console.error(`Failed to fetch ${sheetTitle}:`, err);
      setError(`Unable to load ${sheetTitle} from backend. Please verify your connection.`);
    } finally {
      setLoading(false);
    }
  }, [fetchRegister, sheetTitle, search, quarter, ageingBucket, status, salesPerson, salesType, dateFrom, dateTo, sortBy, sortOrder, pagination.page, pagination.limit]);

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
      invoiceNumber: `${invoicePrefix}${String(nextSrNo).padStart(4, '0')}`,
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

      if (field === 'salesType' && String(value).trim().toUpperCase() === 'RT') {
        updated.status = 'RT';
      }

      return updated;
    });
  };

  // Auto-Fill Calculation button click in modal
  const handleAutoFillCalculations = () => {
    const calcs = computeSystemCalculations(
      formData.invoiceDate,
      formData.paymentTermDays,
      formData.invoiceAmount,
      formData.amtRcvd,
      formData.status
    );
    setFormData(prev => ({
      ...prev,
      dueDate: calcs.dueDate,
      quarter: calcs.quarter,
      outstanding: calcs.outstanding,
      ageingDays: calcs.ageingDays,
      ageingBucket: calcs.ageingBucket
    }));
  };

  // Submit Modal (Create or Edit)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.invoiceNumber.trim() || !formData.companyName.trim()) {
      setFormError('Invoice Number and Company Name are required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        srNo: formData.srNo !== '' && formData.srNo !== null && !isNaN(Number(formData.srNo)) ? Number(formData.srNo) : undefined,
        invoiceNumber: String(formData.invoiceNumber).trim(),
        invoiceDate: formData.invoiceDate,
        basicAmount: Number(formData.basicAmount) || 0,
        invoiceAmount: Number(formData.invoiceAmount) || 0,
        companyName: String(formData.companyName).trim(),
        siteName: formData.siteName ? String(formData.siteName).trim() : '',
        city: formData.city ? String(formData.city).trim() : '',
        salesType: formData.salesType ? String(formData.salesType).trim() : 'Regular',
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
        await createInvoice(payload);
        showToast(`Invoice ${payload.invoiceNumber} created and added to sheet.`);
      } else {
        await updateInvoice(activeItem.id, payload);
        showToast(`Invoice ${payload.invoiceNumber} updated successfully.`);
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

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteId);
      setDeleteId(null);
      showToast('Invoice entry deleted successfully.');
      await loadData();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      alert(err.message || 'Error deleting invoice');
    } finally {
      setDeleting(false);
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

  // CSV Export (all 21 columns)
  const handleExportCsv = () => {
    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = AR_COLUMNS.map(c => `"${c.label}"`).join(',');
    const rows = data.map(item => {
      return [
        item.srNo,
        `"${item.invoiceNo || ''}"`,
        `"${item.invoiceDate ? item.invoiceDate.split('T')[0] : ''}"`,
        item.basicAmount,
        item.invoiceAmount,
        `"${(item.companyName || '').replace(/"/g, '""')}"`,
        `"${(item.siteName || '').replace(/"/g, '""')}"`,
        `"${(item.city || '').replace(/"/g, '""')}"`,
        `"${item.salesType || ''}"`,
        `"${(item.salesPerson || '').replace(/"/g, '""')}"`,
        item.paymentTermDays,
        `"${item.dueDate ? item.dueDate.split('T')[0] : ''}"`,
        item.ageingDays,
        `"${item.ageingBucket || ''}"`,
        `"${item.status || ''}"`,
        item.amtRcvd,
        `"${item.amtRcvdDate ? item.amtRcvdDate.split('T')[0] : ''}"`,
        `"${item.completePaymentDate ? item.completePaymentDate.split('T')[0] : ''}"`,
        item.outstanding,
        `"${(item.remarks || '').replace(/"/g, '""')}"`,
        `"${item.quarter || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${sheetTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ar-sheet-root" style={{
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      padding: isMobile ? '8px 6px 80px' : '0 0 32px 0',
      margin: '0 auto',
      color: '#1e293b',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
            {/* Scoped Mobile Responsive & Interaction Styles */}
      <style>{`
        @keyframes arFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes arSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .ar-sheet-root {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        .ar-btn-touch {
          touch-action: manipulation;
          transition: transform 0.1s ease, background-color 0.15s ease, opacity 0.15s ease;
        }
        .ar-btn-touch:active {
          transform: scale(0.96);
        }
        .ar-card-item {
          animation: arFadeIn 0.2s ease-out;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .ar-card-item:active {
          transform: scale(0.995);
        }
        .ar-scroll-x {
          -webkit-overflow-scrolling: touch;
          overflow-x: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        .ar-scroll-x::-webkit-scrollbar {
          height: 7px;
        }
        .ar-scroll-x::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .ar-scroll-x::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        .ar-scroll-x::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        @media (max-width: 1024px) {
          .ar-mobile-input {
            font-size: 16px !important;
          }
          .ar-table-cell {
            padding: 8px 10px !important;
            font-size: 11px !important;
          }
          .ar-header-actions {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '14px' : '24px',
          left: isMobile ? '12px' : 'auto',
          right: isMobile ? '12px' : '24px',
          zIndex: 9999,
          background: '#065f46',
          color: '#ecfdf5',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="ar-header-bar" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '12px',
        marginBottom: isMobile ? '12px' : '18px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        {/* Title Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: isMobile ? '36px' : '42px',
            height: isMobile ? '36px' : '42px',
            borderRadius: '10px',
            background: brandBg,
            color: brandColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileSpreadsheet size={isMobile ? 20 : 24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                {sheetTitle}
              </h1>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '8px',
                background: brandBg,
                color: brandColor,
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                21 Columns
              </span>
            </div>
            <p style={{ fontSize: isMobile ? '11px' : '13px', color: '#64748b', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="ar-header-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setViewMode('table')}
              title="Table View (All 21 Columns)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: isMobile ? '6px 8px' : '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: activeView === 'table' ? '#fff' : 'transparent',
                color: activeView === 'table' ? '#0f172a' : '#64748b',
                boxShadow: activeView === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              <Table size={13} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Card View"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: isMobile ? '6px 8px' : '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: activeView === 'list' ? '#fff' : 'transparent',
                color: activeView === 'list' ? '#0f172a' : '#64748b',
                boxShadow: activeView === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              <LayoutList size={13} />
              <span>Cards</span>
            </button>
          </div>

          {/* Add Entry Button */}
          <button
            onClick={handleOpenCreate}
            className="ar-btn-touch"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '7px 12px' : '8px 16px',
              background: '#16a34a',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
            }}
          >
            <Plus size={15} />
            <span>Add Entry</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => loadData()}
            title="Refresh Sheet"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '7px 10px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {!isMobile && 'Refresh'}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            title="Export CSV"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '7px 10px',
              background: brandColor,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download size={13} />
            {!isMobile && 'Export'}
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards (Optimized 2x2 + full width for mobile) */}
      <div className="ar-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        marginBottom: isMobile ? '12px' : '16px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ background: '#fff', padding: isMobile ? '10px 12px' : '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Invoices</div>
          <div style={{ fontSize: isMobile ? '17px' : '22px', fontWeight: '800', color: '#0f172a' }}>{totals.count}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>Filtered rows</div>
        </div>

        <div style={{ background: '#fff', padding: isMobile ? '10px 12px' : '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Basic (w/o GST)</div>
          <div style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: '800', color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatCurrency(totals.basicAmount)}
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>Excl cartage</div>
        </div>

        <div style={{ background: '#fff', padding: isMobile ? '10px 12px' : '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Invoice Amount</div>
          <div style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatCurrency(totals.invoiceAmount)}
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>Gross billed</div>
        </div>

        <div style={{ background: '#fff', padding: isMobile ? '10px 12px' : '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', marginBottom: '2px' }}>Amt Received</div>
          <div style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: '800', color: '#16a34a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatCurrency(totals.amtRcvd)}
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>Collections</div>
        </div>

        <div className="ar-kpi-outstanding" style={{
          background: '#fff',
          padding: isMobile ? '10px 14px' : '14px 18px',
          borderRadius: '10px',
          border: '1px solid #fecaca',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          borderLeft: '4px solid #ef4444',
          gridColumn: isMobile ? 'span 2' : 'auto',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          justifyContent: isMobile ? 'space-between' : 'flex-start',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', marginBottom: '2px' }}>Total Outstanding</div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>Net pending recovery</div>
          </div>
          <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#dc2626' }}>
            {formatCurrency(totals.outstanding)}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div style={{
        background: '#fff',
        padding: isMobile ? '10px 12px' : '14px 18px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}>
        {/* Search Row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Invoice, Company, Site, City, Rep..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{
                width: '100%',
                padding: '8px 30px 8px 34px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Toggle Filter Drawer button on mobile */}
          {isMobile && (
            <button
              onClick={() => setShowMobileFilters(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                background: activeFilterCount > 0 ? brandBg : '#f1f5f9',
                border: `1px solid ${activeFilterCount > 0 ? brandColor : '#cbd5e1'}`,
                borderRadius: '8px',
                color: activeFilterCount > 0 ? brandColor : '#475569',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Filter size={13} />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              {showMobileFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        {/* Filter Selectors (Always visible on desktop, Collapsible on Mobile) */}
        {(!isMobile || showMobileFilters) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(135px, 1fr))',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            gap: isMobile ? '8px' : '12px',
            alignItems: 'center',
            marginTop: '12px',
            paddingTop: isMobile ? '10px' : '0',
            borderTop: isMobile ? '1px dashed #e2e8f0' : 'none'
          }}>
            {/* Quarter Filter */}
            <div>
              <label style={{ display: isMobile ? 'block' : 'none', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Quarter</label>
              <select
                value={quarter}
                onChange={(e) => { setQuarter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="ar-mobile-input"
                style={{ width: '100%', padding: isMobile ? '9px 10px' : '7px 8px', fontSize: isMobile ? '16px' : '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
              >
                <option value="ALL">All Quarters</option>
                {filterOptions.quarters.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
                {!filterOptions.quarters.includes('Q1-2026/27') && <option value="Q1-2026/27">Q1-2026/27</option>}
                {!filterOptions.quarters.includes('Q2-2026/27') && <option value="Q2-2026/27">Q2-2026/27</option>}
                {!filterOptions.quarters.includes('Q3-2026/27') && <option value="Q3-2026/27">Q3-2026/27</option>}
                {!filterOptions.quarters.includes('Q4-2026/27') && <option value="Q4-2026/27">Q4-2026/27</option>}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: isMobile ? 'block' : 'none', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="ar-mobile-input"
                style={{ width: '100%', padding: isMobile ? '9px 10px' : '7px 8px', fontSize: isMobile ? '16px' : '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
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
              <label style={{ display: isMobile ? 'block' : 'none', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Ageing</label>
              <select
                value={ageingBucket}
                onChange={(e) => { setAgeingBucket(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="ar-mobile-input"
                style={{ width: '100%', padding: isMobile ? '9px 10px' : '7px 8px', fontSize: isMobile ? '16px' : '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
              >
                <option value="ALL">All Ageing</option>
                {ageingBuckets.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Sales Person Filter */}
            <div>
              <label style={{ display: isMobile ? 'block' : 'none', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Sales Rep</label>
              <select
                value={salesPerson}
                onChange={(e) => { setSalesPerson(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="ar-mobile-input"
                style={{ width: '100%', padding: isMobile ? '9px 10px' : '7px 8px', fontSize: isMobile ? '16px' : '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
              >
                <option value="ALL">All Reps</option>
                {filterOptions.salesPersons.map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            {/* Sales Type Filter */}
            <div>
              <label style={{ display: isMobile ? 'block' : 'none', fontSize: '10px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Type</label>
              <select
                value={salesType}
                onChange={(e) => { setSalesType(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="ar-mobile-input"
                style={{ width: '100%', padding: isMobile ? '9px 10px' : '7px 8px', fontSize: isMobile ? '16px' : '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none' }}
              >
                <option value="ALL">All Sales Types</option>
                {Array.from(new Set(['Regular', 'RT', 'Project', 'Trading', ...(filterOptions?.salesTypes || [])])).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
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
                  gap: '5px',
                  padding: '7px 10px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={11} />
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Chips bar */}
        {activeFilterCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Active:</span>
            {quarter !== 'ALL' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1d4ed8' }}>
                Quarter: {quarter}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setQuarter('ALL')} />
              </span>
            )}
            {status !== 'ALL' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1d4ed8' }}>
                Status: {status}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setStatus('ALL')} />
              </span>
            )}
            {ageingBucket !== 'ALL' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1d4ed8' }}>
                Ageing: {ageingBucket}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setAgeingBucket('ALL')} />
              </span>
            )}
            {salesPerson !== 'ALL' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1d4ed8' }}>
                Rep: {salesPerson}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setSalesPerson('ALL')} />
              </span>
            )}
            {salesType !== 'ALL' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', color: '#1d4ed8' }}>
                Type: {salesType}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => setSalesType('ALL')} />
              </span>
            )}
            <button
              onClick={handleResetFilters}
              style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: '2px 4px' }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '13px' }}>{error}</span>
        </div>
      )}

      {/* Touch swipe notice on mobile table view */}
      {activeView === 'table' && isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          color: '#0369a1',
          marginBottom: '10px'
        }}>
          <Info size={13} style={{ flexShrink: 0 }} />
          <span>Swipe horizontally to view all 21 columns. Columns 1-2 stay pinned.</span>
        </div>
      )}

      {/* 4. Sheet Data Presentation */}
      {activeView === 'list' ? (
        /* Mobile Card View with Expandable 21-Column Details */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              Loading invoices...
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No invoices match your selected filters.
            </div>
          ) : (
            data.map((item, idx) => {
              const isOverdue = item.ageingDays > 0 && item.status !== 'PAID';
              const isExpanded = !!expandedCards[item.id || idx];
              return (
                <div
                  key={item.id || idx}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    padding: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Card Row 1: Sr No, Invoice No, Quarter, Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                        #{item.srNo}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: brandColor }}>
                        {item.invoiceNo}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: brandBg, color: brandColor }}>
                        {item.quarter}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => handleOpenView(item)}
                        className="ar-btn-touch"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '5px 8px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          color: '#15803d',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                        title="View All 21 Columns"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="ar-btn-touch"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '5px 8px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                        title="Edit Invoice"
                      >
                        <Edit2 size={11} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '5px 7px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                        title="Delete Invoice"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Card Row 2: Status, Sales Type & Ageing */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      background: item.status === 'PAID' ? '#dcfce7' : item.status === 'PARTIAL' ? '#fef3c7' : item.status === 'RT' ? '#ede9fe' : '#fee2e2',
                      color: item.status === 'PAID' ? '#15803d' : item.status === 'PARTIAL' ? '#b45309' : item.status === 'RT' ? '#7c3aed' : '#b91c1c'
                    }}>
                      {item.status}
                    </span>
                    <span style={{ padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', background: '#f1f5f9', color: '#475569' }}>
                      {item.salesType}
                    </span>
                    <span style={{ padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', background: '#e0f2fe', color: '#0369a1' }}>
                      {item.ageingBucket} {isOverdue ? `(${item.ageingDays}d)` : ''}
                    </span>
                  </div>

                  {/* Card Row 3: Company & Rep */}
                  <div style={{ marginBottom: '10px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                      <Building2 size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word', lineHeight: 1.35 }}>{item.companyName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#475569' }}>
                      {item.siteName && item.siteName !== '-' && <span>Site: {item.siteName}</span>}
                      {item.city && item.city !== '-' && <span>📍 {item.city}</span>}
                      {item.salesPerson && item.salesPerson !== '-' && <span>Rep: <strong>{item.salesPerson}</strong></span>}
                    </div>
                  </div>

                  {/* Card Row 4: Financial Summary (2x2) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ background: '#f8fafc', padding: '7px 9px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Invoice Amount</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(item.invoiceAmount)}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Basic: {formatCurrency(item.basicAmount)}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '7px 9px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Outstanding</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: Number(item.outstanding) > 0 ? '#dc2626' : '#16a34a' }}>
                        {formatCurrency(item.outstanding)}
                      </div>
                      <div style={{ fontSize: '9px', color: Number(item.amtRcvd) > 0 ? '#16a34a' : '#94a3b8' }}>Rcvd: {formatCurrency(item.amtRcvd)}</div>
                    </div>
                  </div>

                  {/* Toggle Full 21 Columns Accordion Button */}
                  <button
                    onClick={() => toggleCardExpand(item.id || idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      background: isExpanded ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${isExpanded ? '#bfdbfe' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: isExpanded ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View All 21 Columns'}</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {/* Expanded 21-Column Details */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Invoice Date</span>
                        <strong style={{ color: '#1e293b' }}>{formatDate(item.invoiceDate)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Due Date</span>
                        <strong style={{ color: '#1e293b' }}>{formatDate(item.dueDate)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Payment Term</span>
                        <strong style={{ color: '#1e293b' }}>{item.paymentTermDays} Days</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Amt Rcvd Date</span>
                        <strong style={{ color: '#1e293b' }}>{formatDate(item.amtRcvdDate)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Complete Payment Date</span>
                        <strong style={{ color: '#1e293b' }}>{formatDate(item.completePaymentDate)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Ageing Overdue</span>
                        <strong style={{ color: item.ageingDays > 0 ? '#dc2626' : '#16a34a' }}>{item.ageingDays} Days</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Remarks</span>
                        <span style={{ color: '#334155' }}>{item.remarks || '-'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Detailed 21-Column Table View with Fixed Columns & Horizontal Scrolling */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div className="ar-scroll-x" style={{
            overflowX: 'auto',
            maxHeight: isMobile ? '560px' : '720px',
            WebkitOverflowScrolling: 'touch'
          }}>
            <table className="ar-table-sheet" style={{ width: '100%', minWidth: '2200px', borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 20, borderBottom: '2px solid #cbd5e1' }}>
                <tr>
                  {/* Sticky Action Column on left */}
                  <th style={{
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    zIndex: 25,
                    background: '#f8fafc',
                    padding: '12px 10px',
                    fontWeight: '700',
                    color: '#334155',
                    width: isMobile ? '88px' : '136px', minWidth: isMobile ? '88px' : '136px',
                    borderRight: '2px solid #cbd5e1',
                    borderBottom: '2px solid #cbd5e1',
                    textAlign: 'center',
                    boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)'
                  }}>
                    Action
                  </th>
                  {AR_COLUMNS.map((col, cIdx) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        padding: '12px 14px',
                        fontWeight: '700',
                        color: '#334155',
                        textAlign: col.align || 'left',
                        minWidth: col.minWidth,
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderRight: '1px solid #e2e8f0',
                        borderBottom: '2px solid #cbd5e1',
                        background: '#f8fafc'
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
                        Loading {sheetTitle}...
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
                        {/* Sticky Action Column on left */}
                        <td style={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 10,
                          background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                          padding: '8px 10px',
                          textAlign: 'center',
                          borderRight: '2px solid #cbd5e1',
                          borderBottom: '1px solid #f1f5f9',
                          boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <button
                              onClick={() => handleOpenView(item)}
                              title="View Invoice Details"
                              className="ar-btn-touch"
                              style={{
                                padding: '4px 6px',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '4px',
                                color: '#16a34a',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}
                            >
                              <Eye size={12} />
                              {!isMobile && 'View'}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Record"
                              style={{
                                padding: '4px 7px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                color: '#2563eb',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              <Edit2 size={11} />
                              {!isMobile && 'Edit'}
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              title="Delete Record"
                              style={{
                                padding: '4px 6px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>

                        {/* 1. Sr No. */}
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#64748b', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.srNo}
                        </td>

                        {/* 2. Invoice No */}
                        <td style={{ padding: '10px 14px', fontWeight: '700', color: brandColor, borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.invoiceNo}
                        </td>

                        {/* 3. Invoice Date */}
                        <td style={{ padding: '10px 14px', color: '#334155', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatDate(item.invoiceDate)}
                        </td>

                        {/* 4. Basic Amount (W/O Cartage and GST) */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.basicAmount)}
                        </td>

                        {/* 5. Invoice Amount */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#0f172a', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.invoiceAmount)}
                        </td>

                        {/* 6. Company name */}
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.companyName}
                        </td>

                        {/* 7. Site Name */}
                        <td style={{ padding: '10px 14px', color: '#475569', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.siteName}
                        </td>

                        {/* 8. City */}
                        <td style={{ padding: '10px 14px', color: '#475569', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.city}
                        </td>

                        {/* 9. Sales Type */}
                        <td style={{ padding: '10px 14px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
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
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#334155', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.salesPerson}
                        </td>

                        {/* 11. Payment Term (Days) */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#475569', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.paymentTermDays} Days
                        </td>

                        {/* 12. Due Date */}
                        <td style={{ padding: '10px 14px', color: '#334155', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatDate(item.dueDate)}
                        </td>

                        {/* 13. Ageing (Days) */}
                        <td style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontWeight: '700',
                          color: isOverdue ? '#dc2626' : '#16a34a',
                          borderRight: '1px solid #f1f5f9',
                          borderBottom: '1px solid #f1f5f9'
                        }}>
                          {item.ageingDays}
                        </td>

                        {/* 14. Ageing Bucket */}
                        <td style={{ padding: '10px 14px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
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
                        <td style={{ padding: '10px 14px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
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
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: '#16a34a', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.amtRcvd)}
                        </td>

                        {/* 17. Amt Rcvd Date */}
                        <td style={{ padding: '10px 14px', color: '#64748b', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatDate(item.amtRcvdDate)}
                        </td>

                        {/* 18. Complete Payment Date */}
                        <td style={{ padding: '10px 14px', color: '#64748b', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatDate(item.completePaymentDate)}
                        </td>

                        {/* 19. Outstanding */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: Number(item.outstanding) > 0 ? '#dc2626' : '#16a34a', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {formatCurrency(item.outstanding)}
                        </td>

                        {/* 20. Remarks */}
                        <td style={{ padding: '10px 14px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          {item.remarks || '-'}
                        </td>

                        {/* 21. Quarter */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600', color: brandColor, borderBottom: '1px solid #f1f5f9' }}>
                          {item.quarter}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination Controls (Mobile friendly) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '10px 14px' : '14px 20px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        background: '#fff',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          {data.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-{Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} entries
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Rows:</span>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
              style={{ padding: '4px 6px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
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
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: pagination.page <= 1 ? '#f1f5f9' : '#fff',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                color: pagination.page <= 1 ? '#94a3b8' : '#334155'
              }}
            >
              <ChevronLeft size={13} />
            </button>

            <span style={{ padding: '0 6px', fontSize: '11px', fontWeight: '600', color: '#334155' }}>
              {pagination.page} / {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: pagination.page >= pagination.totalPages ? '#f1f5f9' : '#fff',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                color: pagination.page >= pagination.totalPages ? '#94a3b8' : '#334155'
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Data Entry Modal (Mobile Full-Height Sheet with Sticky Header & Footer) */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? 0 : '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: isMobile ? '20px 20px 0 0' : '16px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '920px',
            height: isMobile ? '94dvh' : 'auto',
            maxHeight: isMobile ? '94dvh' : '90vh',
            animation: isMobile ? 'arSlideUp 0.25s ease-out' : 'arFadeIn 0.2s ease-out',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Mobile Drag Handle Indicator */}
            {isMobile && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '2px', background: '#fff' }}>
                <div style={{ width: '38px', height: '4px', borderRadius: '4px', background: '#cbd5e1' }} />
              </div>
            )}

            {/* Modal Header (Sticky) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '14px 16px' : '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: '#fff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', background: brandBg, borderRadius: '8px', color: brandColor }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {modalMode === 'create' ? `Add ${sheetTitle} Entry` : `Edit: ${formData.invoiceNumber}`}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                    All 21 columns editable
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAutoFillCalculations}
                  title="Auto-calculate Due Date, Quarter, Net Outstanding, Ageing"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    cursor: 'pointer'
                  }}
                >
                  <Calculator size={13} />
                  <span>Auto-Fill</span>
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '14px 16px' : '20px 24px',
              WebkitOverflowScrolling: 'touch'
            }}>
              {formError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '16px', fontSize: '12px' }}>
                  {formError}
                </div>
              )}

              <form id="ar-entry-form" onSubmit={handleSaveForm}>
                {/* SECTION 1: INVOICE IDENTIFICATION & DATE */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '10px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    1. Invoice Identification & Date
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
                    {/* 1. Sr No. */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Sr No. *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.srNo}
                        onChange={(e) => handleFieldChange('srNo', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 2. Invoice No */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Invoice No *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.invoiceNumber}
                        onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 3. Invoice Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Invoice Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.invoiceDate}
                        onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 21. Quarter */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Quarter *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Q2-2026/27"
                        value={formData.quarter}
                        onChange={(e) => handleFieldChange('quarter', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CUSTOMER & SALES ATTRIBUTION */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '10px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    2. Customer & Sales Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
                    {/* 6. Company name */}
                    <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Company name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Customer / Company Name"
                        value={formData.companyName}
                        onChange={(e) => handleFieldChange('companyName', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 7. Site Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Site Name
                      </label>
                      <input
                        type="text"
                        placeholder="Site or Project"
                        value={formData.siteName}
                        onChange={(e) => handleFieldChange('siteName', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 8. City */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmedabad, Surat"
                        value={formData.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 9. Sales Type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Sales Type
                      </label>
                      <input
                        type="text"
                        list="ar-sales-type-options"
                        placeholder="e.g. Regular, RT, Project, Trading"
                        value={formData.salesType}
                        onChange={(e) => handleFieldChange('salesType', e.target.value)}
                        className="ar-mobile-input"
                        style={{
                          width: '100%',
                          padding: isMobile ? '10px 12px' : '8px 10px',
                          fontSize: isMobile ? '16px' : '14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          background: '#fff'
                        }}
                      />
                      <datalist id="ar-sales-type-options">
                        <option value="Regular" />
                        <option value="RT" />
                        <option value="Project" />
                        <option value="Trading" />
                        {(filterOptions?.salesTypes || [])
                          .filter((st) => !['Regular', 'RT', 'Project', 'Trading'].includes(st))
                          .map((st) => (
                            <option key={st} value={st} />
                          ))}
                      </datalist>
                    </div>

                    {/* 10. Sales Person */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Sales Person
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sales 1, Sales 2"
                        value={formData.salesPerson}
                        onChange={(e) => handleFieldChange('salesPerson', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: AMOUNTS, TERMS & DUE DATES */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '10px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    3. Commercial Amounts & Schedule
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
                    {/* 4. Basic Amount (W/O Cartage and GST) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Basic Amount *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0"
                        inputMode="decimal"
                        value={formData.basicAmount}
                        onChange={(e) => handleFieldChange('basicAmount', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 5. Invoice Amount */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Invoice Amount *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0"
                        inputMode="decimal"
                        value={formData.invoiceAmount}
                        onChange={(e) => handleFieldChange('invoiceAmount', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 11. Payment Term (Days) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Term (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={formData.paymentTermDays}
                        onChange={(e) => handleFieldChange('paymentTermDays', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 12. Due Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 19. Outstanding */}
                    <div style={{ gridColumn: isMobile ? 'span 2' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Net Outstanding *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        inputMode="decimal"
                        value={formData.outstanding}
                        onChange={(e) => handleFieldChange('outstanding', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none',
                          fontWeight: '800',
                          color: Number(formData.outstanding) > 0 ? '#b91c1c' : '#15803d'
                         }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: RECEIVABLES, STATUS, AGEING & REMARKS */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '10px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    4. Receipts, Status, Ageing & Remarks
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? '10px' : '14px' }}>
                    {/* 15. Status */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff'  }}
                      >
                        <option value="UNPAID">UNPAID</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="PAID">PAID</option>
                        <option value="RT">RT (Retention)</option>
                      </select>
                    </div>

                    {/* 16. Amt Rcvd */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Amt Rcvd
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={formData.amtRcvd}
                        onChange={(e) => handleFieldChange('amtRcvd', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 17. Amt Rcvd Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Amt Rcvd Date
                      </label>
                      <input
                        type="date"
                        value={formData.amtRcvdDate}
                        onChange={(e) => handleFieldChange('amtRcvdDate', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 18. Complete Payment Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Complete Pay Date
                      </label>
                      <input
                        type="date"
                        value={formData.completePaymentDate}
                        onChange={(e) => handleFieldChange('completePaymentDate', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 13. Ageing (Days) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Ageing (Days) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={formData.ageingDays}
                        onChange={(e) => handleFieldChange('ageingDays', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'  }}
                      />
                    </div>

                    {/* 14. Ageing Bucket */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Ageing Bucket *
                      </label>
                      <select
                        value={formData.ageingBucket}
                        onChange={(e) => handleFieldChange('ageingBucket', e.target.value)}
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff'  }}
                      >
                        {ageingBuckets.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* 20. Remarks */}
                    <div style={{ gridColumn: isMobile ? 'span 2' : 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Remarks
                      </label>
                      <textarea
                        rows={2}
                        value={formData.remarks}
                        onChange={(e) => handleFieldChange('remarks', e.target.value)}
                        placeholder="Optional remarks or follow-up notes..."
                        className="ar-mobile-input"
                        style={{ width: '100%', padding: isMobile ? '10px 12px' : '8px 10px', fontSize: isMobile ? '16px' : '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical'  }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer (Sticky at bottom) */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid #e2e8f0',
              padding: isMobile ? '12px 16px' : '16px 24px',
              background: '#fff',
              flexShrink: 0
            }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                style={{
                  padding: isMobile ? '10px 16px' : '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: isMobile ? 1 : 'none'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="ar-entry-form"
                disabled={saving}
                style={{
                  padding: isMobile ? '10px 20px' : '8px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: brandColor,
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  flex: isMobile ? 2 : 'none'
                }}
              >
                <Save size={15} />
                {saving ? 'Saving...' : modalMode === 'create' ? 'Save & Add' : 'Update Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Button (FAB) for Mobile Quick Data Entry */}
      {isMobile && !modalOpen && (
        <button
          onClick={handleOpenCreate}
          className="ar-btn-touch"
          aria-label="Add New Entry"
          style={{
            position: 'fixed',
            bottom: '22px',
            right: '18px',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 18px',
            background: brandColor,
            color: '#fff',
            borderRadius: '50px',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <Plus size={17} />
          <span>Add Entry</span>
        </button>
      )}



            {/* 8. Comprehensive 21-Column View Modal */}
      {viewModalOpen && viewItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: isMobile ? 0 : '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: isMobile ? '20px 20px 0 0' : '16px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '900px',
            height: isMobile ? '94dvh' : 'auto',
            maxHeight: isMobile ? '94dvh' : '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            animation: isMobile ? 'arSlideUp 0.25s ease-out' : 'arFadeIn 0.2s ease-out'
          }}>
            {/* Mobile Drag Handle */}
            {isMobile && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '2px', background: '#fff' }}>
                <div style={{ width: '38px', height: '4px', borderRadius: '4px', background: '#cbd5e1' }} />
              </div>
            )}

            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '14px 16px' : '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: '#fff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: brandBg, borderRadius: '8px', color: brandColor }}>
                  <Eye size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {viewItem.invoiceNo}
                    </h3>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      background: viewItem.status === 'PAID' ? '#dcfce7' : viewItem.status === 'PARTIAL' ? '#fef3c7' : viewItem.status === 'RT' ? '#ede9fe' : '#fee2e2',
                      color: viewItem.status === 'PAID' ? '#15803d' : viewItem.status === 'PARTIAL' ? '#b45309' : viewItem.status === 'RT' ? '#7c3aed' : '#b91c1c'
                    }}>
                      {viewItem.status}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: brandBg, color: brandColor }}>
                      {viewItem.quarter}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                      #{viewItem.srNo}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                    {sheetTitle} • All 21 Columns Detailed View
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="ar-btn-touch"
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '14px 16px' : '20px 24px',
              WebkitOverflowScrolling: 'touch'
            }}>
              {/* Top Financial Breakdown Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>4. Basic Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>
                    {formatCurrency(viewItem.basicAmount)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>w/o Cartage & GST</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>5. Invoice Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {formatCurrency(viewItem.invoiceAmount)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Gross Total Billed</div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>16. Amt Received</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
                    {formatCurrency(viewItem.amtRcvd)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#86efac' }}>Collections to date</div>
                </div>

                <div style={{
                  background: Number(viewItem.outstanding) > 0 ? '#fef2f2' : '#f0fdf4',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${Number(viewItem.outstanding) > 0 ? '#fecaca' : '#bbf7d0'}`
                }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: Number(viewItem.outstanding) > 0 ? '#dc2626' : '#15803d', textTransform: 'uppercase' }}>
                    19. Outstanding
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: Number(viewItem.outstanding) > 0 ? '#dc2626' : '#15803d', marginTop: '2px' }}>
                    {formatCurrency(viewItem.outstanding)}
                  </div>
                  <div style={{ fontSize: '10px', color: Number(viewItem.outstanding) > 0 ? '#fca5a5' : '#86efac' }}>
                    {Number(viewItem.outstanding) > 0 ? 'Pending recovery' : 'Fully settled'}
                  </div>
                </div>
              </div>

              {/* SECTION 1: INVOICE IDENTIFICATION & SCHEDULE */}
              <div style={{ marginBottom: '18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  Invoice Identification & Schedule
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>1. Sr No.</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>#{viewItem.srNo}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>2. Invoice No</span>
                    <strong style={{ fontSize: '13px', color: brandColor }}>{viewItem.invoiceNo}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>3. Invoice Date</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{formatDate(viewItem.invoiceDate)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>11. Payment Term</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewItem.paymentTermDays} Days</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>12. Due Date</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{formatDate(viewItem.dueDate)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>21. Quarter</span>
                    <strong style={{ fontSize: '13px', color: brandColor }}>{viewItem.quarter}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOMER, SITE & SALES ATTRIBUTION */}
              <div style={{ marginBottom: '18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  Customer, Site & Sales Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ gridColumn: isMobile ? 'auto' : 'span 2', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>6. Company name</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Building2 size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                      <strong style={{ fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>{viewItem.companyName}</strong>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>7. Site Name</span>
                    <strong style={{ fontSize: '13px', color: '#334155' }}>{viewItem.siteName || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>8. City</span>
                    <strong style={{ fontSize: '13px', color: '#334155' }}>📍 {viewItem.city || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>9. Sales Type</span>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '2px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: viewItem.salesType === 'RT' ? '#ede9fe' : '#e0f2fe',
                      color: viewItem.salesType === 'RT' ? '#6d28d9' : '#0369a1'
                    }}>
                      {viewItem.salesType}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>10. Sales Person</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewItem.salesPerson || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 3: RECEIPTS, AGEING, STATUS & REMARKS */}
              <div style={{ marginBottom: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  Receipts, Ageing, Status & Remarks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>15. Status</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewItem.status}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>13. Ageing (Days)</span>
                    <strong style={{ fontSize: '13px', color: viewItem.ageingDays > 0 && viewItem.status !== 'PAID' ? '#dc2626' : '#16a34a' }}>
                      {viewItem.ageingDays} Days
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>14. Ageing Bucket</span>
                    <strong style={{ fontSize: '13px', color: '#334155' }}>{viewItem.ageingBucket}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>17. Amt Rcvd Date</span>
                    <strong style={{ fontSize: '13px', color: '#334155' }}>{formatDate(viewItem.amtRcvdDate)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>18. Complete Pay Date</span>
                    <strong style={{ fontSize: '13px', color: '#334155' }}>{formatDate(viewItem.completePaymentDate)}</strong>
                  </div>
                  <div style={{ gridColumn: isMobile ? 'span 2' : 'span 3', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f1f5f9', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>20. Remarks</span>
                    <span style={{ fontSize: '12px', color: '#334155', wordBreak: 'break-word' }}>{viewItem.remarks || 'No remarks recorded for this invoice.'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Actions: Edit / Update, Delete, Close) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '12px 16px' : '16px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#fff',
              flexShrink: 0,
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {/* Delete button */}
              <button
                type="button"
                onClick={() => {
                  const id = viewItem.id;
                  setViewModalOpen(false);
                  setDeleteId(id);
                }}
                className="ar-btn-touch"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="ar-btn-touch"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                {/* Edit / Update Entry button */}
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = viewItem;
                    setViewModalOpen(false);
                    handleOpenEdit(itemToEdit);
                  }}
                  className="ar-btn-touch"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: brandColor,
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit / Update Entry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            maxWidth: '400px',
            width: '100%',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
          }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Confirm Delete
            </h4>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Are you sure you want to delete this invoice record from {sheetTitle}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Download,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  Eye,
  Edit2,
  Archive,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  Building,
  User,
  MapPin,
  Tag,
  Receipt,
  FileText,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import {
  fetchHcpplArManualEntries,
  createHcpplArManualEntry,
  updateHcpplArManualEntry,
  archiveHcpplArManualEntry,
  HcpplArManualEntryDto,
} from '../services/hcpplArManualService';

// Format Indian Rupee currency with exact 2 decimal preservation
export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return '₹0.00';
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
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export interface ManualEntryRecord {
  id: string;
  srNo?: number;
  invoiceNo: string;
  invoiceDate: string;
  basicAmount: number;
  invoiceGstAmount: number;
  invoiceAmount: number;
  partyName: string;
  siteName: string;
  salesType: string;
  salesPerson: string;
  paymentTerm: string;
  ageingDays: number | null;
  managementStatus: 'MGMT' | 'NMGMT';
  ageingBucket: '7 DAYS' | '30 DAYS' | 'MANUALLY';
  dueStatus: 'DUE' | 'YET TO DUE' | 'DUE DAYS';
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTLY PAID' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export default function HcpplArManualView() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ManualEntryRecord[]>([]);
  const [totals, setTotals] = useState({
    totalEntries: 0,
    totalBasicAmount: 0,
    totalGstAmount: 0,
    totalInvoiceAmount: 0,
    mgmtCount: 0,
    nmgmtCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    partlyPaidCount: 0,
    cancelledCount: 0,
  });
  const [filterOptions, setFilterOptions] = useState<{
    salesPersons: string[];
    salesTypes: string[];
  }>({
    salesPersons: [],
    salesTypes: [],
  });

  // Filter States
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [search, setSearch] = useState('');
  const [managementStatus, setManagementStatus] = useState('ALL');
  const [ageingBucket, setAgeingBucket] = useState('ALL');
  const [dueStatus, setDueStatus] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [salesPerson, setSalesPerson] = useState('ALL');
  const [salesType, setSalesType] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ManualEntryRecord | null>(null);

  // Form State
  const initialForm: HcpplArManualEntryDto = {
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    basicAmount: '',
    invoiceGstAmount: '',
    partyName: '',
    siteName: '',
    salesType: 'Regular',
    salesPerson: '',
    paymentTerm: '30 Days',
    ageingDays: '',
    managementStatus: 'NMGMT',
    ageingBucket: '30 DAYS',
    dueStatus: 'DUE',
    paymentStatus: 'UNPAID',
  };
  const [formState, setFormState] = useState<HcpplArManualEntryDto>(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await fetchHcpplArManualEntries({
        dateFilter,
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
        search: search.trim() || undefined,
        managementStatus: managementStatus !== 'ALL' ? managementStatus : undefined,
        ageingBucket: ageingBucket !== 'ALL' ? ageingBucket : undefined,
        dueStatus: dueStatus !== 'ALL' ? dueStatus : undefined,
        paymentStatus: paymentStatus !== 'ALL' ? paymentStatus : undefined,
        salesPerson: salesPerson !== 'ALL' ? salesPerson : undefined,
        salesType: salesType !== 'ALL' ? salesType : undefined,
        page,
        limit,
      });

      if (res && res.items) {
        setRecords(res.items);
        setTotals(res.totals || {});
        setTotalPages(res.pagination?.totalPages || 1);
        if (res.filterOptions) {
          setFilterOptions(res.filterOptions);
        }
      }
    } catch (err: any) {
      console.error('Failed to load HCPPL AR entries:', err);
      toast.error(err.message || 'Failed to fetch HCPPL AR manual entries');
    } finally {
      setLoading(false);
    }
  }, [
    dateFilter,
    customStart,
    customEnd,
    search,
    managementStatus,
    ageingBucket,
    dueStatus,
    paymentStatus,
    salesPerson,
    salesType,
    page,
    limit,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset Filters
  const handleResetFilters = () => {
    setDateFilter('all');
    setCustomStart('');
    setCustomEnd('');
    setSearch('');
    setManagementStatus('ALL');
    setAgeingBucket('ALL');
    setDueStatus('ALL');
    setPaymentStatus('ALL');
    setSalesPerson('ALL');
    setSalesType('ALL');
    setPage(1);
  };

  // Open Create Form
  const handleOpenAdd = () => {
    setFormState({
      ...initialForm,
      invoiceDate: new Date().toISOString().split('T')[0],
    });
    setIsAddOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: ManualEntryRecord) => {
    setSelectedRecord(rec);
    const dateFormatted = rec.invoiceDate
      ? new Date(rec.invoiceDate).toISOString().split('T')[0]
      : '';
    setFormState({
      id: rec.id,
      invoiceNo: rec.invoiceNo,
      invoiceDate: dateFormatted,
      basicAmount: rec.basicAmount,
      invoiceGstAmount: rec.invoiceGstAmount,
      partyName: rec.partyName,
      siteName: rec.siteName !== '—' ? rec.siteName : '',
      salesType: rec.salesType !== '—' ? rec.salesType : '',
      salesPerson: rec.salesPerson !== '—' ? rec.salesPerson : '',
      paymentTerm: rec.paymentTerm !== '—' ? rec.paymentTerm : '',
      ageingDays: rec.ageingDays !== null ? rec.ageingDays : '',
      managementStatus: rec.managementStatus,
      ageingBucket: rec.ageingBucket,
      dueStatus: rec.dueStatus,
      paymentStatus: rec.paymentStatus,
    });
    setIsEditOpen(true);
  };

  // Open View Modal
  const handleOpenView = (rec: ManualEntryRecord) => {
    setSelectedRecord(rec);
    setIsViewOpen(true);
  };

  // Save Create
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.invoiceNo || !formState.partyName || !formState.invoiceDate) {
      toast.error('Invoice No., Date, and Party Name are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      await createHcpplArManualEntry(formState);
      toast.success('HCPPL AR Entry created successfully');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Create error:', err);
      toast.error(err.message || 'Failed to create HCPPL AR entry');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const result = await Swal.fire({
      title: 'Update Entry?',
      text: 'Are you sure you want to update this HCPPL AR entry?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, update it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setFormSubmitting(true);
    try {
      await updateHcpplArManualEntry(selectedRecord.id, formState);
      toast.success('HCPPL AR Entry updated successfully');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update HCPPL AR entry');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Archive Record
  const handleArchive = async (rec: ManualEntryRecord) => {
    const result = await Swal.fire({
      title: 'Archive HCPPL AR Entry?',
      text: `Are you sure you want to archive invoice "${rec.invoiceNo}"? It will be removed from the active register.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, archive entry',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await archiveHcpplArManualEntry(rec.id);
      toast.success(`Entry ${rec.invoiceNo} archived`);
      loadData();
    } catch (err: any) {
      console.error('Archive error:', err);
      toast.error(err.message || 'Failed to archive entry');
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    try {
      toast.loading('Preparing CSV export...');
      const res: any = await fetchHcpplArManualEntries({
        dateFilter,
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
        search: search.trim() || undefined,
        managementStatus: managementStatus !== 'ALL' ? managementStatus : undefined,
        ageingBucket: ageingBucket !== 'ALL' ? ageingBucket : undefined,
        dueStatus: dueStatus !== 'ALL' ? dueStatus : undefined,
        paymentStatus: paymentStatus !== 'ALL' ? paymentStatus : undefined,
        salesPerson: salesPerson !== 'ALL' ? salesPerson : undefined,
        salesType: salesType !== 'ALL' ? salesType : undefined,
        exportAll: true,
      });

      const exportItems = res?.items || [];
      if (exportItems.length === 0) {
        toast.dismiss();
        toast.info('No records to export with active filters');
        return;
      }

      const headers = [
        'Sr No.',
        'Invoice No.',
        'Date',
        'Basic Amount',
        'Invoice GST Amount',
        'Party Name',
        'Site Name',
        'Sales Type',
        'Sales Person',
        'Payment Term',
        'Ageing Days',
        'Management',
        'Ageing Bucket',
        'Due Status',
        'Payment Status',
      ];

      const csvRows = [headers.join(',')];

      exportItems.forEach((r: ManualEntryRecord, idx: number) => {
        const row = [
          idx + 1,
          `"${(r.invoiceNo || '').replace(/"/g, '""')}"`,
          `"${formatDate(r.invoiceDate)}"`,
          Number(r.basicAmount || 0).toFixed(2),
          Number(r.invoiceGstAmount || 0).toFixed(2),
          `"${(r.partyName || '').replace(/"/g, '""')}"`,
          `"${(r.siteName || '').replace(/"/g, '""')}"`,
          `"${(r.salesType || '').replace(/"/g, '""')}"`,
          `"${(r.salesPerson || '').replace(/"/g, '""')}"`,
          `"${(r.paymentTerm || '').replace(/"/g, '""')}"`,
          r.ageingDays !== null ? r.ageingDays : '',
          `"${r.managementStatus || ''}"`,
          `"${r.ageingBucket || ''}"`,
          `"${r.dueStatus || ''}"`,
          `"${r.paymentStatus || ''}"`,
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute(
        'download',
        `HCPPL_AR_Manual_Register_${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success(`Exported ${exportItems.length} records to CSV`);
    } catch (err: any) {
      toast.dismiss();
      console.error('Export error:', err);
      toast.error('Failed to export CSV');
    }
  };

  // Calculate live preview total in entry form
  const formBasicNum = Number(formState.basicAmount) || 0;
  const formGstNum = Number(formState.invoiceGstAmount) || 0;
  const formTotalPreview = Number((formBasicNum + formGstNum).toFixed(2));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                HCPPL AR
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                Manual Register
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              HCPPL Accounts Receivable — Dedicated manual data entry register
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={loading || records.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add HCPPL AR Entry</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Invoices */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Entries
            </span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {totals.totalEntries}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Manual records</p>
        </div>

        {/* Basic Amount */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Basic Amount
            </span>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-2 truncate">
            {formatCurrency(totals.totalBasicAmount)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Excl. GST</p>
        </div>

        {/* GST Amount */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              GST Amount
            </span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2 truncate">
            {formatCurrency(totals.totalGstAmount)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Manual tax</p>
        </div>

        {/* Invoice Total */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Invoice Amount
            </span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2 truncate">
            {formatCurrency(totals.totalInvoiceAmount)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Basic + GST</p>
        </div>

        {/* Management (MGMT vs NMGMT) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Management
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              MGMT: {totals.mgmtCount}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              NMGMT: {totals.nmgmtCount}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Manual category</p>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Payment Status
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xs space-y-0.5">
            <div className="flex justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Paid:</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.paidCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Unpaid:</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.unpaidCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Partly:</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.partlyPaidCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'financial_year', label: 'This Financial Year' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'custom', label: 'Custom Range' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setDateFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                dateFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => {
                  setPage(1);
                  loadData();
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Invoice, Party, Site, Sales..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Management Filter */}
          <div>
            <select
              value={managementStatus}
              onChange={(e) => {
                setManagementStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Management: All</option>
              <option value="MGMT">MGMT</option>
              <option value="NMGMT">NMGMT</option>
            </select>
          </div>

          {/* Ageing Bucket Filter */}
          <div>
            <select
              value={ageingBucket}
              onChange={(e) => {
                setAgeingBucket(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Ageing Bucket: All</option>
              <option value="7 DAYS">7 DAYS</option>
              <option value="30 DAYS">30 DAYS</option>
              <option value="MANUALLY">MANUALLY</option>
            </select>
          </div>

          {/* Due Status Filter */}
          <div>
            <select
              value={dueStatus}
              onChange={(e) => {
                setDueStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Due Status: All</option>
              <option value="DUE">DUE</option>
              <option value="YET TO DUE">YET TO DUE</option>
              <option value="DUE DAYS">DUE DAYS</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Payment Status: All</option>
              <option value="PAID">PAID</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTLY PAID">PARTLY PAID</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Sales Person Filter */}
          <div>
            <select
              value={salesPerson}
              onChange={(e) => {
                setSalesPerson(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Sales Person: All</option>
              {filterOptions.salesPersons.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary / Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{records.length}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totals.totalEntries}</span> manual entries
          </div>

          <button
            onClick={handleResetFilters}
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
          >
            Reset all filters
          </button>
        </div>
      </div>

      {/* Spreadsheet Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative max-h-[640px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-3.5 py-3 w-14 sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                  Sr No.
                </th>
                <th scope="col" className="px-4 py-3 min-w-[150px] sticky left-14 z-30 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                  Invoice No.
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[100px]">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 min-w-[130px] text-right">
                  Basic Amount
                </th>
                <th scope="col" className="px-4 py-3 min-w-[130px] text-right">
                  Invoice GST Amount
                </th>
                <th scope="col" className="px-4 py-3 min-w-[200px]">
                  Party Name
                </th>
                <th scope="col" className="px-4 py-3 min-w-[160px]">
                  Site Name
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[110px]">
                  Sales Type
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[130px]">
                  Sales Person
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[110px]">
                  Payment Term
                </th>
                <th scope="col" className="px-3 py-3 min-w-[90px] text-right">
                  Ageing Days
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[110px] text-center">
                  Management
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[110px] text-center">
                  Ageing Bucket
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[110px] text-center">
                  Due Status
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[120px] text-center">
                  Payment Status
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[110px] text-center sticky right-0 z-20 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={16} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span>Loading HCPPL AR register...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        No HCPPL AR Manual Entries Found
                      </span>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No manual entries match the active filters. Click "+ Add HCPPL AR Entry" to start recording receivables.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r, index) => {
                  const displaySr = (page - 1) * limit + index + 1;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                    >
                      {/* 1. Sr No. */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-500 dark:text-slate-400 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-blue-50/40 dark:group-hover:bg-blue-950/20 border-r border-slate-100 dark:border-slate-800">
                        {displaySr}
                      </td>

                      {/* 2. Invoice No. */}
                      <td className="px-4 py-2.5 font-bold font-mono text-blue-600 dark:text-blue-400 sticky left-14 z-10 bg-white dark:bg-slate-900 group-hover:bg-blue-50/40 dark:group-hover:bg-blue-950/20 border-r border-slate-100 dark:border-slate-800">
                        {r.invoiceNo}
                      </td>

                      {/* 3. Date */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                        {formatDate(r.invoiceDate)}
                      </td>

                      {/* 4. Basic Amount */}
                      <td className="px-4 py-2.5 font-mono text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(r.basicAmount)}
                      </td>

                      {/* 5. Invoice GST Amount */}
                      <td className="px-4 py-2.5 font-mono text-right font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(r.invoiceGstAmount)}
                      </td>

                      {/* 6. Party Name */}
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white max-w-[220px] truncate" title={r.partyName}>
                        {r.partyName}
                      </td>

                      {/* 7. Site Name */}
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 max-w-[180px] truncate" title={r.siteName}>
                        {r.siteName}
                      </td>

                      {/* 8. Sales Type */}
                      <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300">
                        {r.salesType}
                      </td>

                      {/* 9. Sales Person */}
                      <td className="px-3.5 py-2.5 text-slate-800 dark:text-slate-200 font-medium">
                        {r.salesPerson}
                      </td>

                      {/* 10. Payment Term */}
                      <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">
                        {r.paymentTerm}
                      </td>

                      {/* 11. Ageing Days */}
                      <td className="px-3 py-2.5 font-mono text-right font-medium text-slate-700 dark:text-slate-300">
                        {r.ageingDays !== null ? r.ageingDays : '—'}
                      </td>

                      {/* 12. Management (MGMT / NMGMT) */}
                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            r.managementStatus === 'MGMT'
                              ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {r.managementStatus}
                        </span>
                      </td>

                      {/* 13. Ageing Bucket (7 DAYS / 30 DAYS / MANUALLY) */}
                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                            r.ageingBucket === '7 DAYS'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : r.ageingBucket === '30 DAYS'
                              ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                              : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {r.ageingBucket}
                        </span>
                      </td>

                      {/* 14. Due Status (DUE / YET TO DUE / DUE DAYS) */}
                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                            r.dueStatus === 'DUE'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : r.dueStatus === 'YET TO DUE'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {r.dueStatus}
                        </span>
                      </td>

                      {/* 15. Payment Status (PAID / UNPAID / PARTLY PAID / CANCELLED) */}
                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            r.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : r.paymentStatus === 'UNPAID'
                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : r.paymentStatus === 'PARTLY PAID'
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {r.paymentStatus}
                        </span>
                      </td>

                      {/* 16. Actions */}
                      <td className="px-3.5 py-2.5 text-center sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-blue-50/40 dark:group-hover:bg-blue-950/20 border-l border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenView(r)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(r)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded transition-colors"
                            title="Archive entry"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT DRAWER OR MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                  {isAddOpen ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isAddOpen ? 'Add HCPPL AR Entry' : 'Edit HCPPL AR Entry'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAddOpen
                      ? 'Manually enter receivable record into HCPPL register'
                      : `Updating manual record: ${selectedRecord?.invoiceNo}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
              {/* Row 1: Invoice No & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HCPPL/2627/0101"
                    value={formState.invoiceNo}
                    onChange={(e) => setFormState({ ...formState, invoiceNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.invoiceDate}
                    onChange={(e) => setFormState({ ...formState, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Basic Amount & Invoice GST Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Basic Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 33240.00"
                    value={formState.basicAmount}
                    onChange={(e) => setFormState({ ...formState, basicAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice GST Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 5983.20"
                    value={formState.invoiceGstAmount}
                    onChange={(e) => setFormState({ ...formState, invoiceGstAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informational Total Display (Does not overwrite inputs) */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs">
                <span className="text-blue-800 dark:text-blue-300 font-medium">
                  Calculated Total Amount (Basic + GST):
                </span>
                <span className="text-blue-900 dark:text-blue-200 font-bold font-mono text-sm">
                  {formatCurrency(formTotalPreview)}
                </span>
              </div>

              {/* Row 3: Party Name & Site Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Party Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer / Company Name"
                    value={formState.partyName}
                    onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    placeholder="Site / Project / Location"
                    value={formState.siteName || ''}
                    onChange={(e) => setFormState({ ...formState, siteName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Sales Type & Sales Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sales Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Regular, RT, Direct..."
                    value={formState.salesType || ''}
                    onChange={(e) => setFormState({ ...formState, salesType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sales Person
                  </label>
                  <input
                    type="text"
                    placeholder="Sales Person Name"
                    value={formState.salesPerson || ''}
                    onChange={(e) => setFormState({ ...formState, salesPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Payment Term & Ageing Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Term
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Days, 15 Days, 30 Days..."
                    value={formState.paymentTerm || ''}
                    onChange={(e) => setFormState({ ...formState, paymentTerm: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ageing Days (Manual Numeric)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 0, 15, 45..."
                    value={formState.ageingDays !== null && formState.ageingDays !== undefined ? formState.ageingDays : ''}
                    onChange={(e) => setFormState({ ...formState, ageingDays: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 6: Management & Ageing Bucket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Management Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.managementStatus}
                    onChange={(e) =>
                      setFormState({ ...formState, managementStatus: e.target.value as 'MGMT' | 'NMGMT' })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MGMT">MGMT</option>
                    <option value="NMGMT">NMGMT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ageing Bucket <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.ageingBucket}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        ageingBucket: e.target.value as '7 DAYS' | '30 DAYS' | 'MANUALLY',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7 DAYS">7 DAYS</option>
                    <option value="30 DAYS">30 DAYS</option>
                    <option value="MANUALLY">MANUALLY</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Due Status & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.dueStatus}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        dueStatus: e.target.value as 'DUE' | 'YET TO DUE' | 'DUE DAYS',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DUE">DUE</option>
                    <option value="YET TO DUE">YET TO DUE</option>
                    <option value="DUE DAYS">DUE DAYS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.paymentStatus}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        paymentStatus: e.target.value as 'PAID' | 'UNPAID' | 'PARTLY PAID' | 'CANCELLED',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PAID">PAID</option>
                    <option value="UNPAID">UNPAID</option>
                    <option value="PARTLY PAID">PARTLY PAID</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : isAddOpen ? 'Save Entry' : 'Update Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    HCPPL AR Entry Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedRecord.invoiceNo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-500">Party Name:</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.partyName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Site Name:</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.siteName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-500">Invoice Date:</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {formatDate(selectedRecord.invoiceDate)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Basic Amount:</span>
                  <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {formatCurrency(selectedRecord.basicAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">GST Amount:</span>
                  <p className="font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                    {formatCurrency(selectedRecord.invoiceGstAmount)}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Total Invoice Amount (Basic + GST):
                </span>
                <span className="font-bold font-mono text-base text-blue-600 dark:text-blue-400">
                  {formatCurrency(selectedRecord.invoiceAmount)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-500">Sales Type:</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.salesType}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Sales Person:</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.salesPerson}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Payment Term:</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.paymentTerm}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Ageing Days</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedRecord.ageingDays !== null ? selectedRecord.ageingDays : '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Management</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {selectedRecord.managementStatus}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Bucket</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {selectedRecord.ageingBucket}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Payment</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedRecord.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

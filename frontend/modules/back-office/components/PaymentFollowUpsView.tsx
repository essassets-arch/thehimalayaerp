'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit2,
  Archive,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Receipt,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import {
  fetchPaymentFollowUpEntries,
  createPaymentFollowUpEntry,
  updatePaymentFollowUpEntry,
  archivePaymentFollowUpEntry,
  PaymentFollowUpEntryDto,
} from '../services/paymentFollowUpsService';

// Format Indian Rupee currency with 2 decimals
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

export interface FollowUpRecord {
  id: string;
  srNo?: number;
  partyName: string;
  duePaymentAmount: number;
  salesPerson: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentFollowUpsView() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  const [totals, setTotals] = useState({
    totalFollowUps: 0,
    totalDuePaymentAmount: 0,
  });

  // Filters State
  const [search, setSearch] = useState('');
  const [salesPersonFilter, setSalesPersonFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Dynamic filter lists from backend
  const [salesPersonsList, setSalesPersonsList] = useState<string[]>([]);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FollowUpRecord | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const initialForm: PaymentFollowUpEntryDto = {
    partyName: '',
    duePaymentAmount: '',
    salesPerson: '',
    remarks: '',
  };

  const [formState, setFormState] = useState<PaymentFollowUpEntryDto>(initialForm);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await fetchPaymentFollowUpEntries({
        search,
        salesPerson: salesPersonFilter !== 'ALL' ? salesPersonFilter : undefined,
        minAmount: minAmount !== '' ? minAmount : undefined,
        maxAmount: maxAmount !== '' ? maxAmount : undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      const data: any = res?.data || res;
      if (data?.items || Array.isArray(data)) {
        setRecords(Array.isArray(data) ? data : data.items || []);
        setTotals(
          data.totals || {
            totalFollowUps: 0,
            totalDuePaymentAmount: 0,
          }
        );
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        if (data.filterOptions?.salesPersons) {
          setSalesPersonsList(data.filterOptions.salesPersons);
        }
      } else {
        toast.error(res?.message || 'Failed to load payment follow up records');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching payment follow ups data');
    } finally {
      setLoading(false);
    }
  }, [search, salesPersonFilter, minAmount, maxAmount, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSalesPersonFilter('ALL');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  // Open Create Form
  const handleOpenAdd = () => {
    setFormState(initialForm);
    setIsAddOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: FollowUpRecord) => {
    setSelectedRecord(rec);
    setFormState({
      id: rec.id,
      partyName: rec.partyName,
      duePaymentAmount: rec.duePaymentAmount,
      salesPerson: rec.salesPerson !== '—' ? rec.salesPerson : '',
      remarks: rec.remarks || '',
    });
    setIsEditOpen(true);
  };

  // Open View Modal
  const handleOpenView = (rec: FollowUpRecord) => {
    setSelectedRecord(rec);
    setIsViewOpen(true);
  };

  // Save Create
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.partyName || formState.duePaymentAmount === undefined || formState.duePaymentAmount === '') {
      toast.error('Party Name and Due Payment Amount are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      await createPaymentFollowUpEntry(formState);
      toast.success('Payment Follow Up Entry created successfully');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create payment follow up record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.id) return;
    if (!formState.partyName || formState.duePaymentAmount === undefined || formState.duePaymentAmount === '') {
      toast.error('Party Name and Due Payment Amount are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      await updatePaymentFollowUpEntry(formState.id, formState);
      toast.success('Payment Follow Up Entry updated successfully');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update payment follow up record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Soft Delete / Archive
  const handleArchive = async (rec: FollowUpRecord) => {
    const result = await Swal.fire({
      title: 'Archive Follow-Up Entry?',
      text: `Are you sure you want to archive payment follow-up for "${rec.partyName}"? This record will be safely soft-deleted from the active register.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, archive entry',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await archivePaymentFollowUpEntry(rec.id);
        toast.success('Follow-up entry archived successfully');
        loadData();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to archive entry');
      }
    }
  };

  // Export to CSV
  const handleExportCsv = async () => {
    try {
      toast.info('Preparing CSV export of all matching records...');
      const res: any = await fetchPaymentFollowUpEntries({
        search,
        salesPerson: salesPersonFilter !== 'ALL' ? salesPersonFilter : undefined,
        minAmount: minAmount !== '' ? minAmount : undefined,
        maxAmount: maxAmount !== '' ? maxAmount : undefined,
        sortBy,
        sortOrder,
        exportAll: true,
      });

      const data: any = res?.data || res;
      const items: FollowUpRecord[] = data?.items || (Array.isArray(data) ? data : []);
      if (items.length === 0) {
        toast.warning('No records available to export');
        return;
      }

      const headers = [
        'SR NO',
        'PARTY NAME',
        'DUE PAYMENT AMOUNT',
        'SALES PERSON',
        'REMARKS',
      ];

      const csvRows = [headers.join(',')];

      items.forEach((item, idx) => {
        const row = [
          idx + 1,
          `"${(item.partyName || '').replace(/"/g, '""')}"`,
          Number(item.duePaymentAmount || 0).toFixed(2),
          `"${(item.salesPerson || '').replace(/"/g, '""')}"`,
          `"${(item.remarks || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payment_follow_ups_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${items.length} records successfully!`);
    } catch (err: any) {
      toast.error('CSV Export failed');
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      padding: isMobile ? '12px 12px 28px' : '24px 32px',
      maxWidth: '1600px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: isMobile ? '16px' : '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(5, 150, 105, 0.28)',
            flexShrink: 0
          }}>
            <Receipt size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                PAYMENT FOLLOW UPS
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                100% Manual Register
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
              Manual customer payment follow-up and collection tracking register
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh Table"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} style={{ color: '#64748b' }} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            title="Download CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Download size={15} style={{ color: '#64748b' }} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.28)'
            }}
          >
            <Plus size={16} />
            <span>+ Add Follow-Up Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Total Follow-Ups */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Follow-Ups
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px' }}>
              {totals.totalFollowUps.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
              Active follow-up accounts
            </span>
          </div>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#eff6ff',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Receipt size={22} />
          </div>
        </div>

        {/* Total Due Amount */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Manual Follow-Up Amount
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', fontFamily: 'monospace', margin: '4px 0 2px' }}>
              {formatCurrency(totals.totalDuePaymentAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
              Sum of manual payment targets
            </span>
          </div>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={22} />
          </div>
        </div>

        {/* Average Due Amount per Party */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Average Target / Party
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0d9488', fontFamily: 'monospace', margin: '4px 0 2px' }}>
              {totals.totalFollowUps > 0
                ? formatCurrency(totals.totalDuePaymentAmount / totals.totalFollowUps)
                : '₹0.00'}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488' }} />
              Mean follow-up exposure
            </span>
          </div>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#f0fdfa',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Party Name, Sales Person, Remarks..."
              style={{
                width: '100%',
                padding: '8px 32px 8px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
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
                  background: 'none',
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
        </div>

        {/* Dropdown Filters & Amount Range */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          {/* Sales Person Filter */}
          <select
            value={salesPersonFilter}
            onChange={(e) => {
              setSalesPersonFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Sales Persons</option>
            {salesPersonsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Amount Range Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>₹ Min:</span>
            <input
              type="number"
              placeholder="Min Amount (₹)"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setPage(1);
              }}
              style={{ width: '110px', border: 'none', background: 'transparent', fontSize: '12px', outline: 'none', color: '#334155' }}
            />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Max:</span>
            <input
              type="number"
              placeholder="Max Amount (₹)"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value);
                setPage(1);
              }}
              style={{ width: '110px', border: 'none', background: 'transparent', fontSize: '12px', outline: 'none', color: '#334155' }}
            />
          </div>

          {/* Items Per Page */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              marginLeft: isMobile ? '0' : 'auto'
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #fecdd3',
              background: '#fff1f2',
              color: '#e11d48',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Mobile Swipe Notice */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: '#ecfdf5',
            borderBottom: '1px solid #d1fae5',
            fontSize: '11px',
            color: '#059669'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
              Scroll horizontally to view all follow-up details
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', textTransform: 'uppercase' }}>Swipe →</span>
          </div>
        )}

        <div style={{ overflowX: 'auto', maxHeight: '680px', overflowY: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead style={{
              background: '#f8fafc',
              color: '#475569',
              position: 'sticky',
              top: 0,
              zIndex: 20,
              borderBottom: '1.5px solid #e2e8f0',
              userSelect: 'none'
            }}>
              <tr>
                <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center', width: '64px', fontSize: '11px', letterSpacing: '0.04em' }}>SR NO</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', width: '280px', fontSize: '11px', letterSpacing: '0.04em' }}>PARTY NAME</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right', width: '220px', fontSize: '11px', letterSpacing: '0.04em' }}>DUE PAYMENT AMOUNT</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', width: '200px', fontSize: '11px', letterSpacing: '0.04em' }}>SALES PERSON</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '11px', letterSpacing: '0.04em' }}>REMARKS</th>
                <th style={{
                  padding: '12px 10px',
                  fontWeight: '700',
                  textAlign: 'center',
                  position: 'sticky',
                  right: 0,
                  background: '#f8fafc',
                  zIndex: 30,
                  width: '110px',
                  boxShadow: '-6px 0 12px rgba(0,0,0,0.04)',
                  fontSize: '11px',
                  letterSpacing: '0.04em'
                }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody style={{ color: '#334155' }}>
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <RefreshCw size={28} className="animate-spin" style={{ color: '#059669' }} />
                      <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Loading payment follow up entries...</p>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <FileSpreadsheet size={36} style={{ color: '#cbd5e1' }} />
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#475569', margin: 0 }}>
                        No Payment Follow Up entries found
                      </p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '380px', margin: 0 }}>
                        {search || salesPersonFilter !== 'ALL' || minAmount || maxAmount
                          ? 'Try adjusting your filters or search terms.'
                          : 'Click "+ Add Follow-Up Entry" to record your first follow-up target.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700', color: '#94a3b8' }}>
                      {rec.srNo}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {rec.partyName}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', fontFamily: 'monospace', color: '#059669', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {formatCurrency(rec.duePaymentAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#475569', fontWeight: '500' }}>
                      {rec.salesPerson || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }} title={rec.remarks}>
                      {rec.remarks || '—'}
                    </td>
                    <td style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      position: 'sticky',
                      right: 0,
                      background: '#ffffff',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      boxShadow: '-6px 0 12px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenView(rec)}
                          title="View Details"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit Entry"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: '#d97706',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleArchive(rec)}
                          title="Archive / Delete"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: '#e11d48',
                            cursor: 'pointer'
                          }}
                        >
                          <Archive size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div>
            Showing <strong style={{ color: '#0f172a' }}>{totalItems === 0 ? 0 : (page - 1) * limit + 1}</strong> to{' '}
            <strong style={{ color: '#0f172a' }}>{Math.min(page * limit, totalItems)}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <span style={{ padding: '0 8px', fontWeight: '600', color: '#334155' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.4 : 1
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE ENTRY MODAL */}
      {isAddOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#ecfdf5', color: '#059669' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Add Payment Follow Up Entry</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Record customer payment follow-up target manually</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  PARTY NAME <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter customer / party name"
                  value={formState.partyName}
                  onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  DUE PAYMENT AMOUNT (₹) <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formState.duePaymentAmount}
                  onChange={(e) => setFormState({ ...formState, duePaymentAmount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: '#059669', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  SALES PERSON
                </label>
                <input
                  type="text"
                  placeholder="Sales representative name"
                  value={formState.salesPerson}
                  onChange={(e) => setFormState({ ...formState, salesPerson: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  REMARKS
                </label>
                <textarea
                  rows={3}
                  placeholder="Follow-up notes, promised date, or collection status"
                  value={formState.remarks}
                  onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.28)',
                    opacity: formSubmitting ? 0.6 : 1
                  }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Follow-Up Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ENTRY MODAL */}
      {isEditOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#fffbeb', color: '#d97706' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Edit Payment Follow Up Entry</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Update payment follow-up target</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  PARTY NAME <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.partyName}
                  onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  DUE PAYMENT AMOUNT (₹) <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formState.duePaymentAmount}
                  onChange={(e) => setFormState({ ...formState, duePaymentAmount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: '#059669', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  SALES PERSON
                </label>
                <input
                  type="text"
                  value={formState.salesPerson}
                  onChange={(e) => setFormState({ ...formState, salesPerson: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  REMARKS
                </label>
                <textarea
                  rows={3}
                  value={formState.remarks}
                  onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#d97706',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(217, 119, 6, 0.28)',
                    opacity: formSubmitting ? 0.6 : 1
                  }}
                >
                  {formSubmitting ? 'Updating...' : 'Update Follow-Up Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && selectedRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#ecfdf5', color: '#059669' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Payment Follow-Up Details</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>SR NO: {selectedRecord.srNo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Party Name</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{selectedRecord.partyName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>DUE PAYMENT AMOUNT</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#059669', fontSize: '18px' }}>
                    {formatCurrency(selectedRecord.duePaymentAmount)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Sales Person</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{selectedRecord.salesPerson || '—'}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Remarks</span>
                <p style={{ margin: 0, padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', lineHeight: '1.5' }}>
                  {selectedRecord.remarks || 'No remarks entered.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', marginTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setIsViewOpen(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
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

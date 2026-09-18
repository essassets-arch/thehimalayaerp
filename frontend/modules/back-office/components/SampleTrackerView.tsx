'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Package,
  Truck,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileText,
  DollarSign,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import {
  fetchSampleTrackerEntries,
  createSampleTrackerEntry,
  updateSampleTrackerEntry,
  archiveSampleTrackerEntry,
  SampleTrackerEntryDto,
} from '../services/sampleTrackerService';

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

export interface SampleRecord {
  id: string;
  srNo?: number;
  dispatchDate: string;
  partyName: string;
  station: string;
  contactPerson: string;
  contactNumber: string;
  sampleDetails: string;
  referancePerson: string;
  referaceNumber: string;
  materialManually: string;
  transportMode: string;
  transportAmount: number;
  status: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export default function SampleTrackerView() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SampleRecord[]>([]);
  const [totals, setTotals] = useState({
    totalEntries: 0,
    totalTransportAmount: 0,
    todayEntries: 0,
    thisMonthEntries: 0,
    approvalAwaitedCount: 0,
    approvedCount: 0,
  });

  // Filters State
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [transportModeFilter, setTransportModeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dispatchDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Dynamic filter lists from backend
  const [transportModesList, setTransportModesList] = useState<string[]>([]);
  const [statusesList, setStatusesList] = useState<string[]>([]);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SampleRecord | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const initialForm: SampleTrackerEntryDto = {
    dispatchDate: new Date().toISOString().split('T')[0],
    partyName: '',
    station: '',
    contactPerson: '',
    contactNumber: '',
    sampleDetails: '',
    referancePerson: '',
    referaceNumber: '',
    materialManually: '',
    transportMode: 'BY HAND',
    transportAmount: 0,
    status: 'SAMPLE GIVEN',
    remarks: '',
  };

  const [formState, setFormState] = useState<SampleTrackerEntryDto>(initialForm);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await fetchSampleTrackerEntries({
        dateFilter,
        startDate: dateFilter === 'custom' ? customStart : undefined,
        endDate: dateFilter === 'custom' ? customEnd : undefined,
        search,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        transportMode: transportModeFilter !== 'ALL' ? transportModeFilter : undefined,
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
            totalEntries: 0,
            totalTransportAmount: 0,
            todayEntries: 0,
            thisMonthEntries: 0,
            approvalAwaitedCount: 0,
            approvedCount: 0,
          }
        );
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        if (data.filterOptions?.transportModes) {
          setTransportModesList(data.filterOptions.transportModes);
        }
        if (data.filterOptions?.statuses) {
          setStatusesList(data.filterOptions.statuses);
        }
      } else {
        toast.error(res?.message || 'Failed to load sample tracker records');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching sample tracker data');
    } finally {
      setLoading(false);
    }
  }, [
    dateFilter,
    customStart,
    customEnd,
    search,
    statusFilter,
    transportModeFilter,
    sortBy,
    sortOrder,
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
    setStatusFilter('ALL');
    setTransportModeFilter('ALL');
    setSortBy('dispatchDate');
    setSortOrder('desc');
    setPage(1);
  };

  // Open Create Form
  const handleOpenAdd = () => {
    setFormState({
      ...initialForm,
      dispatchDate: new Date().toISOString().split('T')[0],
    });
    setIsAddOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: SampleRecord) => {
    setSelectedRecord(rec);
    const dateFormatted = rec.dispatchDate
      ? new Date(rec.dispatchDate).toISOString().split('T')[0]
      : '';
    setFormState({
      id: rec.id,
      dispatchDate: dateFormatted,
      partyName: rec.partyName,
      station: rec.station !== '—' ? rec.station : '',
      contactPerson: rec.contactPerson !== '—' ? rec.contactPerson : '',
      contactNumber: rec.contactNumber !== '—' ? rec.contactNumber : '',
      sampleDetails: rec.sampleDetails !== '—' ? rec.sampleDetails : '',
      referancePerson: rec.referancePerson !== '—' ? rec.referancePerson : '',
      referaceNumber: rec.referaceNumber !== '—' ? rec.referaceNumber : '',
      materialManually: rec.materialManually !== '—' ? rec.materialManually : '',
      transportMode: rec.transportMode as any,
      transportAmount: rec.transportAmount,
      status: rec.status as any,
      remarks: rec.remarks || '',
    });
    setIsEditOpen(true);
  };

  // Open View Modal
  const handleOpenView = (rec: SampleRecord) => {
    setSelectedRecord(rec);
    setIsViewOpen(true);
  };

  // Save Create
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.dispatchDate || !formState.partyName || !formState.transportMode) {
      toast.error('Date, Party Name, and Transport Mode are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      await createSampleTrackerEntry(formState);
      toast.success('Sample Tracker Entry created successfully');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create sample record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.id) return;
    if (!formState.dispatchDate || !formState.partyName || !formState.transportMode) {
      toast.error('Date, Party Name, and Transport Mode are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      await updateSampleTrackerEntry(formState.id, formState);
      toast.success('Sample Tracker Entry updated successfully');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update sample record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Soft Delete / Archive
  const handleArchive = async (rec: SampleRecord) => {
    const result = await Swal.fire({
      title: 'Archive Sample Entry?',
      text: `Are you sure you want to archive sample dispatch for "${rec.partyName}"? This record will be safely soft-deleted from the active register.`,
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
        await archiveSampleTrackerEntry(rec.id);
        toast.success('Sample entry archived successfully');
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
      const res: any = await fetchSampleTrackerEntries({
        dateFilter,
        startDate: dateFilter === 'custom' ? customStart : undefined,
        endDate: dateFilter === 'custom' ? customEnd : undefined,
        search,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        transportMode: transportModeFilter !== 'ALL' ? transportModeFilter : undefined,
        sortBy,
        sortOrder,
        exportAll: true,
      });

      const data: any = res?.data || res;
      const items: SampleRecord[] = data?.items || (Array.isArray(data) ? data : []);
      if (items.length === 0) {
        toast.warning('No records available to export');
        return;
      }

      const headers = [
        'SR NO',
        'DATE',
        'PARTY NAME',
        'STATION',
        'CONTACT PERSON',
        'CONTACT NUMBER',
        'SAMPLE DETAILS',
        'REFERANCE PERSON',
        'REFERACE NUMBER',
        'MATERIAL MANUALLY',
        'TRANSPORT MODE',
        'TRANSPORT AMOUNT',
        'STATUS',
        'REMARKS',
      ];

      const csvRows = [headers.join(',')];

      items.forEach((item, idx) => {
        const row = [
          idx + 1,
          `"${item.dispatchDate ? new Date(item.dispatchDate).toISOString().split('T')[0] : ''}"`,
          `"${(item.partyName || '').replace(/"/g, '""')}"`,
          `"${(item.station || '').replace(/"/g, '""')}"`,
          `"${(item.contactPerson || '').replace(/"/g, '""')}"`,
          `"${(item.contactNumber || '').replace(/"/g, '""')}"`,
          `"${(item.sampleDetails || '').replace(/"/g, '""')}"`,
          `"${(item.referancePerson || '').replace(/"/g, '""')}"`,
          `"${(item.referaceNumber || '').replace(/"/g, '""')}"`,
          `"${(item.materialManually || '').replace(/"/g, '""')}"`,
          `"${(item.transportMode || '').replace(/"/g, '""')}"`,
          item.transportAmount || 0,
          `"${(item.status || '').replace(/"/g, '""')}"`,
          `"${(item.remarks || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sample_tracker_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${items.length} records successfully!`);
    } catch (err: any) {
      toast.error('CSV Export failed');
    }
  };

  // Responsive Mobile Hook
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Status Badge Colors
  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'APPROVED':
      case 'ORDER RECEIVED':
        return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
      case 'APPROVAL AWAITED':
      case 'SAMPLE GIVEN':
        return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
      case 'REJECTED':
        return { background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' };
      default:
        return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ORDER RECEIVED':
        return '#10b981';
      case 'APPROVAL AWAITED':
      case 'SAMPLE GIVEN':
        return '#f59e0b';
      case 'REJECTED':
        return '#f43f5e';
      default:
        return '#94a3b8';
    }
  };

  const getTransportModeBadgeStyle = (mode: string): React.CSSProperties => {
    switch (mode) {
      case 'AIR':
        return { background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' };
      case 'BY HAND':
        return { background: '#ecfeff', color: '#0e7490', border: '1px solid #a5f3fc' };
      case 'BUS':
        return { background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' };
      case 'DELIVERY':
        return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      case 'CONTAINER':
        return { background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff' };
      default:
        return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  return (
    <div style={{
      padding: isMobile ? '12px 12px 28px' : '24px 32px',
      maxWidth: '1800px',
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
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.28)',
            flexShrink: 0
          }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                SAMPLE TRACKER
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                background: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }} />
                100% Manual Register
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
              Customer sample dispatch recording, follow-up status, and courier tracking sheet
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ color: '#4f46e5' }} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={loading || records.length === 0}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <Download size={14} style={{ color: '#64748b' }} />
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
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.28)'
            }}
          >
            <Plus size={15} />
            <span>+ Add Sample Entry</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: isMobile ? '10px' : '16px',
        marginBottom: '20px'
      }}>
        {/* Total Samples */}
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Samples</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5' }}><Package size={16} /></div>
          </div>
          <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{totals.totalEntries}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Active manual sample records
          </div>
        </div>

        {/* Total Transport Amount */}
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Transport Amt</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '800', color: '#059669', marginTop: '6px', fontFamily: 'monospace' }}>{formatCurrency(totals.totalTransportAmount)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Recorded freight expenditure</div>
        </div>

        {/* This Month Dispatches */}
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Month Dispatches</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}><Calendar size={16} /></div>
          </div>
          <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>{totals.thisMonthEntries}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Current calendar month (IST)</div>
        </div>

        {/* Approval Awaited */}
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval Awaited</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fffbeb', color: '#d97706' }}><Clock size={16} /></div>
          </div>
          <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>{totals.approvalAwaitedCount}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{totals.approvedCount} approved so far</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        padding: isMobile ? '12px' : '16px 20px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '18px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {/* Quick Date Filters - Segmented Control */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            borderRadius: '10px',
            padding: '3px',
            gap: '2px',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setDateFilter(tab.id);
                  setPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: dateFilter === tab.id ? '#ffffff' : 'transparent',
                  color: dateFilter === tab.id ? '#4338ca' : '#64748b',
                  fontSize: '12px',
                  fontWeight: dateFilter === tab.id ? '700' : '600',
                  boxShadow: dateFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : '400px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Party, Contact, Reference, Material..."
              style={{
                width: '100%',
                padding: '8px 32px 8px 34px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a'
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters & Custom Date Pickers */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff'
                }}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff'
                }}
              />
            </div>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#334155'
            }}
          >
            <option value="ALL">All Statuses</option>
            {Array.from(new Set(['SAMPLE GIVEN', 'APPROVAL AWAITED', 'APPROVED', 'REJECTED', 'ORDER RECEIVED', ...statusesList])).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Transport Mode Filter */}
          <select
            value={transportModeFilter}
            onChange={(e) => {
              setTransportModeFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#334155'
            }}
          >
            <option value="ALL">All Transport Modes</option>
            {transportModesList.map((tm) => (
              <option key={tm} value={tm}>
                {tm}
              </option>
            ))}
          </select>

          {/* Items Per Page */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#334155',
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
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid #fecdd3',
              background: '#fff1f2',
              color: '#e11d48',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{
        background: '#fff',
        borderRadius: '14px',
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
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '11px',
            color: '#64748b'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }} />
              Scroll horizontally to view all sample details
            </span>
            <span style={{ fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', fontSize: '10px' }}>Swipe →</span>
          </div>
        )}

        <div style={{ overflowX: 'auto', maxHeight: '650px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1500px', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', textAlign: 'center', width: '60px' }}>SR NO</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '100px' }}>DATE</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '180px' }}>PARTY NAME</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '120px' }}>STATION</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '130px' }}>CONTACT PERSON</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '120px' }}>CONTACT NUMBER</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '180px' }}>SAMPLE DETAILS</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '140px' }}>REFERANCE PERSON</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '130px' }}>REFERACE NUMBER</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '160px' }}>MATERIAL MANUALLY</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '120px' }}>TR. MODE</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', textAlign: 'right', width: '110px' }}>TR. AMOUNT</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', textAlign: 'center', width: '130px' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', color: '#475569', fontSize: '11px', width: '150px' }}>REMARKS</th>
                <th style={{
                  padding: '12px 14px',
                  fontWeight: '700',
                  color: '#475569',
                  fontSize: '11px',
                  textAlign: 'center',
                  position: 'sticky',
                  right: 0,
                  background: '#f8fafc',
                  zIndex: 20,
                  width: '100px',
                  boxShadow: '-4px 0 8px rgba(0,0,0,0.04)'
                }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={15} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#4f46e5' }} />
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Loading sample tracker entries...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={15} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                    <FileSpreadsheet size={36} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#475569' }}>No Sample Tracker entries found</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                      Click "+ Add Sample Entry" to record your first sample dispatch.
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700', color: '#94a3b8' }}>
                      {rec.srNo}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontWeight: '600', color: '#1e293b' }}>
                      {formatDate(rec.dispatchDate)}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {rec.partyName}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {rec.station || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {rec.contactPerson || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                      {rec.contactNumber || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }} title={rec.sampleDetails}>
                      {rec.sampleDetails || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {rec.referancePerson || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                      {rec.referaceNumber || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {rec.materialManually || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        ...getTransportModeBadgeStyle(rec.transportMode)
                      }}>
                        {rec.transportMode}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#059669', whiteSpace: 'nowrap' }}>
                      {formatCurrency(rec.transportAmount)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        ...getStatusBadgeStyle(rec.status)
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusDot(rec.status) }} />
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }} title={rec.remarks}>
                      {rec.remarks || '—'}
                    </td>
                    <td style={{
                      padding: '10px 14px',
                      textAlign: 'center',
                      position: 'sticky',
                      right: 0,
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      boxShadow: '-4px 0 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenView(rec)}
                          title="View Details"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#4f46e5',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit Entry"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#d97706',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleArchive(rec)}
                          title="Archive / Delete"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: '1px solid #fecdd3',
                            background: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer'
                          }}
                        >
                          <Archive size={13} />
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
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '10px',
          fontSize: '12px',
          color: '#64748b',
          background: '#f8fafc'
        }}>
          <div>
            Showing <strong style={{ color: '#0f172a' }}>{totalItems === 0 ? 0 : (page - 1) * limit + 1}</strong> to <strong style={{ color: '#0f172a' }}>{Math.min(page * limit, totalItems)}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isMobile ? 'center' : 'flex-end' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontWeight: '600', color: '#334155', padding: '0 8px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.4 : 1
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE ENTRY MODAL */}
      {isAddOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '12px' : '24px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '640px',
            width: '100%',
            padding: '24px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add Sample Tracker Entry</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Record customer sample dispatch details manually</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    DATE <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.dispatchDate}
                    onChange={(e) => setFormState({ ...formState, dispatchDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    PARTY NAME <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer / party name"
                    value={formState.partyName}
                    onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>STATION</label>
                  <input
                    type="text"
                    placeholder="City, State or Location"
                    value={formState.station}
                    onChange={(e) => setFormState({ ...formState, station: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>CONTACT PERSON</label>
                  <input
                    type="text"
                    placeholder="Contact person name"
                    value={formState.contactPerson}
                    onChange={(e) => setFormState({ ...formState, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>CONTACT NUMBER</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={formState.contactNumber}
                    onChange={(e) => setFormState({ ...formState, contactNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>REFERANCE PERSON</label>
                  <input
                    type="text"
                    placeholder="Internal reference / sales executive"
                    value={formState.referancePerson}
                    onChange={(e) => setFormState({ ...formState, referancePerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>REFERACE NUMBER</label>
                  <input
                    type="text"
                    placeholder="Docket, Tracking, or Reference No"
                    value={formState.referaceNumber}
                    onChange={(e) => setFormState({ ...formState, referaceNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    MATERIAL MANUALLY <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter material description manually"
                    value={formState.materialManually}
                    onChange={(e) => setFormState({ ...formState, materialManually: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>TRANSPORT MODE</label>
                  <select
                    value={formState.transportMode}
                    onChange={(e) => setFormState({ ...formState, transportMode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  >
                    <option value="BY HAND">BY HAND</option>
                    <option value="AIR">AIR</option>
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="BUS">BUS</option>
                    <option value="CONTAINER">CONTAINER</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>TRANSPORT AMOUNT (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formState.transportAmount}
                    onChange={(e) => setFormState({ ...formState, transportAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>STATUS</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  >
                    <option value="SAMPLE GIVEN">SAMPLE GIVEN</option>
                    <option value="APPROVAL AWAITED">APPROVAL AWAITED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="ORDER RECEIVED">ORDER RECEIVED</option>
                  </select>
                </div>

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>SAMPLE DETAILS</label>
                  <input
                    type="text"
                    placeholder="Quantity, shade, size, thickness specifications"
                    value={formState.sampleDetails}
                    onChange={(e) => setFormState({ ...formState, sampleDetails: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>REMARKS</label>
                  <textarea
                    rows={2}
                    placeholder="Optional feedback, tracking notes, or client response"
                    value={formState.remarks}
                    onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
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
                    background: '#4f46e5',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                    opacity: formSubmitting ? 0.6 : 1
                  }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Sample Entry'}
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
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '12px' : '24px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '640px',
            width: '100%',
            padding: '24px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#fffbeb', color: '#d97706' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Edit Sample Tracker Entry</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Update sample dispatch record</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    DATE <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.dispatchDate}
                    onChange={(e) => setFormState({ ...formState, dispatchDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    PARTY NAME <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.partyName}
                    onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>STATION</label>
                  <input
                    type="text"
                    value={formState.station}
                    onChange={(e) => setFormState({ ...formState, station: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>CONTACT PERSON</label>
                  <input
                    type="text"
                    value={formState.contactPerson}
                    onChange={(e) => setFormState({ ...formState, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>CONTACT NUMBER</label>
                  <input
                    type="text"
                    value={formState.contactNumber}
                    onChange={(e) => setFormState({ ...formState, contactNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>REFERANCE PERSON</label>
                  <input
                    type="text"
                    value={formState.referancePerson}
                    onChange={(e) => setFormState({ ...formState, referancePerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>REFERACE NUMBER</label>
                  <input
                    type="text"
                    value={formState.referaceNumber}
                    onChange={(e) => setFormState({ ...formState, referaceNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    MATERIAL MANUALLY <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.materialManually}
                    onChange={(e) => setFormState({ ...formState, materialManually: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>TRANSPORT MODE</label>
                  <select
                    value={formState.transportMode}
                    onChange={(e) => setFormState({ ...formState, transportMode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  >
                    <option value="BY HAND">BY HAND</option>
                    <option value="AIR">AIR</option>
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="BUS">BUS</option>
                    <option value="CONTAINER">CONTAINER</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>TRANSPORT AMOUNT (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.transportAmount}
                    onChange={(e) => setFormState({ ...formState, transportAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>STATUS</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  >
                    <option value="SAMPLE GIVEN">SAMPLE GIVEN</option>
                    <option value="APPROVAL AWAITED">APPROVAL AWAITED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="ORDER RECEIVED">ORDER RECEIVED</option>
                  </select>
                </div>

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>SAMPLE DETAILS</label>
                  <input
                    type="text"
                    value={formState.sampleDetails}
                    onChange={(e) => setFormState({ ...formState, sampleDetails: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>REMARKS</label>
                  <textarea
                    rows={2}
                    value={formState.remarks}
                    onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
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
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                    opacity: formSubmitting ? 0.6 : 1
                  }}
                >
                  {formSubmitting ? 'Updating...' : 'Update Sample Entry'}
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
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '12px' : '24px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Sample Dispatch Details</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>SR NO: {selectedRecord.srNo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Date</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{formatDate(selectedRecord.dispatchDate)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Status</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: '700',
                    marginTop: '2px',
                    ...getStatusBadgeStyle(selectedRecord.status)
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: getStatusDot(selectedRecord.status) }} />
                    {selectedRecord.status}
                  </span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Party Name</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{selectedRecord.partyName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Station</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{selectedRecord.station || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Contact Person</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{selectedRecord.contactPerson || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Contact Number</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>{selectedRecord.contactNumber || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>REFERANCE PERSON</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{selectedRecord.referancePerson || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>REFERACE NUMBER</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>{selectedRecord.referaceNumber || '—'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>MATERIAL MANUALLY</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{selectedRecord.materialManually || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Transport Mode</span>
                  <span style={{ fontWeight: '700', color: '#4338ca' }}>{selectedRecord.transportMode}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Transport Amount</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#059669' }}>{formatCurrency(selectedRecord.transportAmount)}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Sample Details</span>
                <p style={{ margin: 0, padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.5' }}>
                  {selectedRecord.sampleDetails || 'No sample specifications recorded.'}
                </p>
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

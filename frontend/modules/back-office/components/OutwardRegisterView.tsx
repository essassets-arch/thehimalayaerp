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
  Truck,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Boxes,
  Trash2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import {
  fetchOutwardRegisterEntries,
  createOutwardRegisterEntry,
  updateOutwardRegisterEntry,
  archiveOutwardRegisterEntry,
  OutwardRegisterEntryDto,
  OutwardRegisterItem,
} from '../services/outwardRegisterService';

// Format quantity with 3 decimal places (authoritative ERP precision)
export function formatQuantity(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return '0.000';
  const num = Number(value);
  const parts = num.toFixed(3).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return `${integerPart}.${decimalPart}`;
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

export function getReceivingBadge(status: string | undefined | null): string {
  if (!status || status.trim() === '' || status === '—') {
    return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700';
  }
  const s = status.toUpperCase();
  if (s.includes('RECEIVED') || s.includes('OK') || s.includes('YES') || s.includes('DONE') || s.includes('DELIVERED')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (s.includes('PENDING') || s.includes('TRANSIT') || s.includes('DISPATCHED')) {
    return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }
  return 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
}

export function getReceivingDot(status: string | undefined | null): string {
  if (!status || status.trim() === '' || status === '—') return 'bg-slate-400';
  const s = status.toUpperCase();
  if (s.includes('RECEIVED') || s.includes('OK') || s.includes('YES') || s.includes('DONE') || s.includes('DELIVERED')) {
    return 'bg-emerald-500';
  }
  if (s.includes('PENDING') || s.includes('TRANSIT') || s.includes('DISPATCHED')) {
    return 'bg-amber-500';
  }
  return 'bg-sky-500';
}

export interface OutwardRecord {
  id: string;
  srNo?: number;
  outwardDate: string;
  transporterName: string;
  vehicleNo: string;
  material: string;
  quantity: number;
  items?: OutwardRegisterItem[];
  partyName: string;
  salesPerson: string;
  invoiceNo: string;
  receivingManually: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number | string;
  unit: string;
}

export interface FormState extends OutwardRegisterEntryDto {
  items: FormItem[];
}

export default function OutwardRegisterView() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<OutwardRecord[]>([]);
  const [totals, setTotals] = useState({
    totalEntries: 0,
    totalQuantity: 0,
    todayEntries: 0,
    thisMonthEntries: 0,
    receivedCount: 0,
    pendingCount: 0,
  });

  // Filters State
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [search, setSearch] = useState('');
  const [transporterFilter, setTransporterFilter] = useState('ALL');
  const [salesPersonFilter, setSalesPersonFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('outwardDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Dynamic filter lists from backend
  const [transportersList, setTransportersList] = useState<string[]>([]);
  const [salesPersonsList, setSalesPersonsList] = useState<string[]>([]);

  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OutwardRecord | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const initialForm: FormState = {
    outwardDate: new Date().toISOString().split('T')[0],
    transporterName: '',
    vehicleNo: '',
    material: '',
    quantity: '',
    items: [
      { id: 'item-1', productId: '', productName: '', quantity: '', unit: 'Sets' }
    ],
    partyName: '',
    salesPerson: '',
    invoiceNo: '',
    receivingManually: '',
    remark: '',
  };

  const [formState, setFormState] = useState<FormState>(initialForm);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await fetchOutwardRegisterEntries({
        dateFilter,
        startDate: dateFilter === 'custom' ? customStart : undefined,
        endDate: dateFilter === 'custom' ? customEnd : undefined,
        search,
        transporterName: transporterFilter !== 'ALL' ? transporterFilter : undefined,
        salesPerson: salesPersonFilter !== 'ALL' ? salesPersonFilter : undefined,
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
            totalQuantity: 0,
            todayEntries: 0,
            thisMonthEntries: 0,
            receivedCount: 0,
            pendingCount: 0,
          }
        );
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        if (data.filterOptions?.transporters) {
          setTransportersList(data.filterOptions.transporters);
        }
        if (data.filterOptions?.salesPersons) {
          setSalesPersonsList(data.filterOptions.salesPersons);
        }
      } else {
        toast.error(res?.message || 'Failed to load outward register records');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching outward register data');
    } finally {
      setLoading(false);
    }
  }, [
    dateFilter,
    customStart,
    customEnd,
    search,
    transporterFilter,
    salesPersonFilter,
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
    setTransporterFilter('ALL');
    setSalesPersonFilter('ALL');
    setSortBy('outwardDate');
    setSortOrder('desc');
    setPage(1);
  };

  // Open Create Form
  const handleOpenAdd = () => {
    setFormState({
      ...initialForm,
      outwardDate: new Date().toISOString().split('T')[0],
      items: [
        { id: `item-${Date.now()}`, productId: '', productName: '', quantity: '', unit: 'Sets' },
      ],
    });
    setIsAddOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: OutwardRecord) => {
    setSelectedRecord(rec);
    const dateFormatted = rec.outwardDate
      ? new Date(rec.outwardDate).toISOString().split('T')[0]
      : '';

    let initialItems: FormItem[] = [];
    if (Array.isArray(rec.items) && rec.items.length > 0) {
      initialItems = rec.items.map((it: any, idx: number) => ({
        id: `edit-item-${idx}`,
        productId: it.productId || '',
        productName: it.productName || it.product || '',
        quantity: it.quantity,
        unit: it.unit || 'Sets',
      }));
    } else {
      initialItems = [
        {
          id: 'edit-item-0',
          productId: '',
          productName: rec.material || '',
          quantity: rec.quantity || '',
          unit: 'Sets',
        },
      ];
    }

    setFormState({
      id: rec.id,
      outwardDate: dateFormatted,
      transporterName: rec.transporterName,
      vehicleNo: rec.vehicleNo !== '—' ? rec.vehicleNo : '',
      material: rec.material,
      quantity: rec.quantity,
      items: initialItems,
      partyName: rec.partyName,
      salesPerson: rec.salesPerson !== '—' ? rec.salesPerson : '',
      invoiceNo: rec.invoiceNo !== '—' ? rec.invoiceNo : '',
      receivingManually: rec.receivingManually !== '—' ? rec.receivingManually : '',
      remark: rec.remark || '',
    });
    setIsEditOpen(true);
  };

  // Item List Handlers
  const handleAddItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: `item-${Date.now()}-${Math.random()}`, productId: '', productName: '', quantity: '', unit: 'Sets' },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormState((prev) => {
      const updated = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: updated.length > 0 ? updated : [
          { id: `item-${Date.now()}`, productId: '', productName: '', quantity: '', unit: 'Sets' },
        ],
      };
    });
  };

  const handleUpdateItem = (index: number, patch: Partial<FormItem>) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  };

  // Helper to validate and build payload
  const buildOutwardPayload = () => {
    if (!formState.outwardDate || !formState.transporterName || !formState.partyName) {
      toast.error('Date, Transporter Name, and Party Name are required.');
      return null;
    }

    const validItems = (formState.items || []).filter(
      (it) => it.productName && it.productName.trim() !== ''
    );
    if (validItems.length === 0) {
      toast.error('Please enter at least one product with its quantity.');
      return null;
    }

    const anyInvalidQty = validItems.some((it) => isNaN(Number(it.quantity)) || Number(it.quantity) <= 0);
    if (anyInvalidQty) {
      toast.error('Please enter a valid quantity greater than zero for all products.');
      return null;
    }

    const totalQty = validItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
    const derivedMaterial = validItems.length === 1
      ? validItems[0].productName.trim()
      : validItems.map((it) => `${it.productName.trim()} (${formatQuantity(it.quantity)}${it.unit ? ` ${it.unit}` : ''})`).join(', ');

    return {
      ...formState,
      material: derivedMaterial,
      quantity: totalQty,
      items: validItems.map((it) => ({
        productId: it.productId,
        productName: it.productName.trim(),
        product: it.productName.trim(),
        quantity: Number(it.quantity) || 0,
        unit: it.unit || 'Sets',
      })),
    };
  };

  // Open View Modal
  const handleOpenView = (rec: OutwardRecord) => {
    setSelectedRecord(rec);
    setIsViewOpen(true);
  };

  // Save Create
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildOutwardPayload();
    if (!payload) return;

    setFormSubmitting(true);
    try {
      await createOutwardRegisterEntry(payload);
      toast.success('Outward Register Entry created successfully');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create outward record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.id) return;
    const payload = buildOutwardPayload();
    if (!payload) return;

    setFormSubmitting(true);
    try {
      await updateOutwardRegisterEntry(formState.id, payload);
      toast.success('Outward Register Entry updated successfully');
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update outward record');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Soft Delete / Archive
  const handleArchive = async (rec: OutwardRecord) => {
    const result = await Swal.fire({
      title: 'Archive Outward Entry?',
      text: `Are you sure you want to archive outward movement for "${rec.partyName}"? This record will be safely soft-deleted from the active register.`,
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
        await archiveOutwardRegisterEntry(rec.id);
        toast.success('Outward entry archived successfully');
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
      const res: any = await fetchOutwardRegisterEntries({
        dateFilter,
        startDate: dateFilter === 'custom' ? customStart : undefined,
        endDate: dateFilter === 'custom' ? customEnd : undefined,
        search,
        transporterName: transporterFilter !== 'ALL' ? transporterFilter : undefined,
        salesPerson: salesPersonFilter !== 'ALL' ? salesPersonFilter : undefined,
        sortBy,
        sortOrder,
        exportAll: true,
      });

      const data: any = res?.data || res;
      const items: OutwardRecord[] = data?.items || (Array.isArray(data) ? data : []);
      if (items.length === 0) {
        toast.warning('No records available to export');
        return;
      }

      const headers = [
        'SR NO',
        'DATE',
        'TRANSPORTER NAME',
        'VEHICLE NO.',
        'PRODUCT(S) & QUANTITY',
        'TOTAL QUANTITY',
        'PARTY NAME',
        'SALES PERSON',
        'INVOICE NO',
        'RECEIVING MANUALLY',
        'REMARK',
      ];

      const csvRows = [headers.join(',')];

      items.forEach((item, idx) => {
        let productSummary = item.material || '';
        if (Array.isArray(item.items) && item.items.length > 0) {
          productSummary = item.items
            .map((it: any) => `${it.productName || it.product || 'Product'} (${Number(it.quantity || 0).toFixed(3)}${it.unit ? ` ${it.unit}` : ''})`)
            .join('; ');
        }

        const row = [
          idx + 1,
          `"${item.outwardDate ? new Date(item.outwardDate).toISOString().split('T')[0] : ''}"`,
          `"${(item.transporterName || '').replace(/"/g, '""')}"`,
          `"${(item.vehicleNo || '').replace(/"/g, '""')}"`,
          `"${productSummary.replace(/"/g, '""')}"`,
          Number(item.quantity || 0).toFixed(3),
          `"${(item.partyName || '').replace(/"/g, '""')}"`,
          `"${(item.salesPerson || '').replace(/"/g, '""')}"`,
          `"${(item.invoiceNo || '').replace(/"/g, '""')}"`,
          `"${(item.receivingManually || '').replace(/"/g, '""')}"`,
          `"${(item.remark || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `outward_register_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${items.length} records successfully!`);
    } catch (err: any) {
      toast.error('CSV Export failed');
    }
  };

  const getReceivingBadgeStyle = (status: string | undefined | null): React.CSSProperties => {
    if (!status || status.trim() === '' || status === '—') {
      return { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };
    }
    const s = status.toUpperCase();
    if (s.includes('RECEIVED') || s.includes('OK') || s.includes('YES') || s.includes('DONE') || s.includes('DELIVERED')) {
      return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
    }
    if (s.includes('PENDING') || s.includes('TRANSIT') || s.includes('DISPATCHED')) {
      return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
    }
    return { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' };
  };

  const getReceivingDotColor = (status: string | undefined | null): string => {
    if (!status || status.trim() === '' || status === '—') return '#94a3b8';
    const s = status.toUpperCase();
    if (s.includes('RECEIVED') || s.includes('OK') || s.includes('YES') || s.includes('DONE') || s.includes('DELIVERED')) {
      return '#10b981';
    }
    if (s.includes('PENDING') || s.includes('TRANSIT') || s.includes('DISPATCHED')) {
      return '#f59e0b';
    }
    return '#0284c7';
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
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.28)',
            flexShrink: 0
          }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                OUTWARD REGISTER
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                background: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #bae6fd'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
                100% Manual Register
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
              Manual outward material movements and delivery register
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.28)'
            }}
          >
            <Plus size={16} />
            <span>+ Add Outward Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Total Outward Entries */}
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
              Total Outward
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px' }}>
              {totals.totalEntries.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
              Active register records
            </span>
          </div>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#f0f9ff',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={22} />
          </div>
        </div>

        {/* Total Quantity */}
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
              Total Quantity
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace', margin: '4px 0 2px' }}>
              {formatQuantity(totals.totalQuantity)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0369a1' }} />
              Precision Decimal(18,3)
            </span>
          </div>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Boxes size={22} />
          </div>
        </div>

        {/* Today Outward */}
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
              Today Outward
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0891b2', margin: '4px 0 2px' }}>
              {totals.todayEntries}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0891b2' }} />
              Recorded today
            </span>
          </div>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#ecfeff',
            color: '#0891b2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} />
          </div>
        </div>

        {/* This Month Outward */}
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
              This Month Outward
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', margin: '4px 0 2px' }}>
              {totals.thisMonthEntries}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
              Current calendar month
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
            <TrendingUp size={22} />
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
          {/* Quick Date Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            width: 'fit-content'
          }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_month', label: 'This Month' },
              { id: 'custom', label: 'Custom' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setDateFilter(f.id);
                  setPage(1);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  background: dateFilter === f.id ? '#0284c7' : 'transparent',
                  color: dateFilter === f.id ? '#ffffff' : '#475569',
                  boxShadow: dateFilter === f.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Party, Transporter, Material, Vehicle..."
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

        {/* Dropdown Filters & Custom Dates */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPage(1);
                }}
                style={{ border: 'none', background: 'transparent', fontSize: '12px', outline: 'none', color: '#334155' }}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPage(1);
                }}
                style={{ border: 'none', background: 'transparent', fontSize: '12px', outline: 'none', color: '#334155' }}
              />
            </div>
          )}

          {/* Transporter Filter */}
          <select
            value={transporterFilter}
            onChange={(e) => {
              setTransporterFilter(e.target.value);
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
            <option value="ALL">All Transporters</option>
            {transportersList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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
            background: '#f0f9ff',
            borderBottom: '1px solid #e0f2fe',
            fontSize: '11px',
            color: '#0369a1'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
              Scroll horizontally to view all outward details
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', textTransform: 'uppercase' }}>Swipe →</span>
          </div>
        )}

        <div style={{ overflowX: 'auto', maxHeight: '680px', overflowY: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse', minWidth: '1500px' }}>
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
                <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center', width: '56px', fontSize: '11px', letterSpacing: '0.04em' }}>SR NO</th>
                <th style={{ padding: '12px 10px', fontWeight: '700', width: '110px', fontSize: '11px', letterSpacing: '0.04em' }}>DATE</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', width: '180px', fontSize: '11px', letterSpacing: '0.04em' }}>TRANSPORTER NAME</th>
                <th style={{ padding: '12px 10px', fontWeight: '700', width: '130px', fontSize: '11px', letterSpacing: '0.04em' }}>VEHICLE NO.</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', width: '240px', fontSize: '11px', letterSpacing: '0.04em' }}>PRODUCT(S) & QTY</th>
                <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'right', width: '130px', fontSize: '11px', letterSpacing: '0.04em' }}>TOTAL QTY</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', width: '200px', fontSize: '11px', letterSpacing: '0.04em' }}>PARTY NAME</th>
                <th style={{ padding: '12px 10px', fontWeight: '700', width: '140px', fontSize: '11px', letterSpacing: '0.04em' }}>SALES PERSON</th>
                <th style={{ padding: '12px 10px', fontWeight: '700', width: '120px', fontSize: '11px', letterSpacing: '0.04em' }}>INVOICE NO</th>
                <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center', width: '160px', fontSize: '11px', letterSpacing: '0.04em' }}>RECEIVING MANUALLY</th>
                <th style={{ padding: '12px 14px', fontWeight: '700', width: '180px', fontSize: '11px', letterSpacing: '0.04em' }}>REMARK</th>
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
                  <td colSpan={12} style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <RefreshCw size={28} className="animate-spin" style={{ color: '#0284c7' }} />
                      <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Loading outward register entries...</p>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <FileSpreadsheet size={36} style={{ color: '#cbd5e1' }} />
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#475569', margin: 0 }}>
                        No Outward Register entries found
                      </p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '380px', margin: 0 }}>
                        {search || transporterFilter !== 'ALL' || salesPersonFilter !== 'ALL'
                          ? 'Try adjusting your filters or search terms.'
                          : 'Click "+ Add Outward Entry" to record your first outward material movement.'}
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
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', color: '#0f172a', fontWeight: '600' }}>
                      {formatDate(rec.outwardDate)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {rec.transporterName}
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', fontFamily: 'monospace', color: '#334155', fontWeight: '600' }}>
                      {rec.vehicleNo || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', minWidth: '220px' }}>
                      {rec.items && rec.items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {rec.items.map((it: any, itIdx: number) => (
                            <div
                              key={itIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                fontSize: '12px',
                              }}
                            >
                              <span style={{ fontWeight: '600', color: '#0f172a' }}>
                                {it.productName || it.product || rec.material}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#0284c7',
                                  background: '#f0f9ff',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  whiteSpace: 'nowrap',
                                  border: '1px solid #e0f2fe',
                                }}
                              >
                                {formatQuantity(it.quantity)} {it.unit || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '12px' }}>
                          {rec.material}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontWeight: '700', fontFamily: 'monospace', color: '#0284c7', fontSize: '13px' }}>
                          {formatQuantity(rec.quantity)}
                        </span>
                        {rec.items && rec.items.length > 1 && (
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                            {rec.items.length} products
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {rec.partyName}
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', color: '#475569', fontWeight: '500' }}>
                      {rec.salesPerson || '—'}
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', fontFamily: 'monospace', color: '#334155' }}>
                      {rec.invoiceNo || '—'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {rec.receivingManually && rec.receivingManually !== '—' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            ...getReceivingBadgeStyle(rec.receivingManually)
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: getReceivingDotColor(rec.receivingManually) }} />
                          {rec.receivingManually}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }} title={rec.remark}>
                      {rec.remark || '—'}
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
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '8px' : '20px 16px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: isMobile ? '14px' : '16px',
            maxWidth: '680px',
            width: '100%',
            margin: 'auto 0',
            maxHeight: isMobile ? '96vh' : 'calc(100vh - 40px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header - Always pinned at top */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '12px 16px' : '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#f0f9ff', color: '#0284c7' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Add Outward Register Entry</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Record outward material dispatch details manually</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form with scrollable body */}
            <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0, overflowY: 'auto', padding: isMobile ? '14px 16px' : '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      DATE <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.outwardDate}
                      onChange={(e) => setFormState({ ...formState, outwardDate: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      TRASNPORTER NAME <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="e.g. VRL Logistics, TCI, Direct"
                      value={formState.transporterName}
                      onChange={(e) => setFormState({ ...formState, transporterName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      VEHICLE NO.
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. MH-12-AB-1234"
                      value={formState.vehicleNo}
                      onChange={(e) => setFormState({ ...formState, vehicleNo: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* PRODUCTS & QUANTITIES - STRICTLY MANUAL ENTRY */}
                  <div style={{
                    gridColumn: isMobile ? '1' : 'span 2',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: isMobile ? '12px' : '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Boxes size={15} style={{ color: '#0284c7' }} />
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                          PRODUCTS & QUANTITIES <span style={{ color: '#e11d48' }}>*</span>
                        </label>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          ({formState.items.length} {formState.items.length === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Total Qty:</span>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          fontWeight: '800',
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {formatQuantity(formState.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0))}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formState.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          style={{
                            background: '#ffffff',
                            padding: isMobile ? '10px' : '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          {isMobile ? (
                            /* Mobile Stacked Layout */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                                  PRODUCT #{idx + 1}
                                </label>
                                <input
                                  type="text"
                                  required
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  placeholder={idx === 0 ? "Material description / grade" : "Material / product name"}
                                  value={it.productName}
                                  onChange={(e) => handleUpdateItem(idx, { productName: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                                    QUANTITY
                                  </label>
                                  <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    required
                                    placeholder="0.000"
                                    value={it.quantity}
                                    onChange={(e) => handleUpdateItem(idx, { quantity: e.target.value })}
                                    style={{
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      fontSize: '13px',
                                      outline: 'none',
                                      fontFamily: 'monospace',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                                <div style={{ width: '95px' }}>
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                                    UNIT
                                  </label>
                                  <select
                                    value={it.unit || 'Sets'}
                                    onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                                    style={{
                                      width: '100%',
                                      padding: '8px 6px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      fontSize: '12px',
                                      outline: 'none',
                                      background: '#ffffff',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    <option value="Sets">Sets</option>
                                    <option value="Nos">Nos</option>
                                    <option value="Pcs">Pcs</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Mtr">Mtr</option>
                                    <option value="Boxes">Boxes</option>
                                  </select>
                                </div>
                                <div style={{ width: '36px', display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
                                  {formState.items.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      title="Remove item"
                                      style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ef4444',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  ) : (
                                    <span style={{ width: '32px', height: '32px' }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Desktop Grid Layout */
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0, 1fr) 130px 95px 36px',
                              gap: '8px',
                              alignItems: 'center'
                            }}>
                              <div>
                                <input
                                  type="text"
                                  required
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  placeholder={idx === 0 ? "Material description / grade" : "Material / product name"}
                                  value={it.productName}
                                  onChange={(e) => handleUpdateItem(idx, { productName: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>

                              <div>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0.001"
                                  required
                                  placeholder="0.000"
                                  value={it.quantity}
                                  onChange={(e) => handleUpdateItem(idx, { quantity: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>

                              <div>
                                <select
                                  value={it.unit || 'Sets'}
                                  onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    outline: 'none',
                                    background: '#ffffff',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <option value="Sets">Sets</option>
                                  <option value="Nos">Nos</option>
                                  <option value="Pcs">Pcs</option>
                                  <option value="Kg">Kg</option>
                                  <option value="Mtr">Mtr</option>
                                  <option value="Boxes">Boxes</option>
                                </select>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {formState.items.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    title="Remove item"
                                    style={{
                                      background: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      width: '32px',
                                      height: '32px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#ef4444',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                ) : (
                                  <span style={{ width: '32px', height: '32px' }} />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px dashed #0284c7',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={13} />
                        Add Another Product
                      </button>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Enter manual material description and quantities
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      PARTY NAME <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="Enter customer / party name"
                      value={formState.partyName}
                      onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      SALES PERSON
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Sales representative name"
                      value={formState.salesPerson}
                      onChange={(e) => setFormState({ ...formState, salesPerson: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      INVOICE NO
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Invoice or Challan number"
                      value={formState.invoiceNo}
                      onChange={(e) => setFormState({ ...formState, invoiceNo: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      RECEIVING MANUALLY
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. Received, Pending, Delivered with signed copy"
                      value={formState.receivingManually}
                      onChange={(e) => setFormState({ ...formState, receivingManually: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      REMARK
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Optional remarks, destination notes, or follow-up details"
                      value={formState.remark}
                      onChange={(e) => setFormState({ ...formState, remark: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Always pinned at bottom */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: isMobile ? '12px 16px' : '14px 22px',
                borderTop: '1px solid #f1f5f9',
                background: '#ffffff',
                flexShrink: 0
              }}>
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
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.28)',
                    opacity: formSubmitting ? 0.6 : 1
                  }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Outward Entry'}
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
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '8px' : '20px 16px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: isMobile ? '14px' : '16px',
            maxWidth: '680px',
            width: '100%',
            margin: 'auto 0',
            maxHeight: isMobile ? '96vh' : 'calc(100vh - 40px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header - Always pinned at top */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '12px 16px' : '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#fffbeb', color: '#d97706' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Edit Outward Register Entry</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Update outward material dispatch details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form with scrollable body */}
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0, overflowY: 'auto', padding: isMobile ? '14px 16px' : '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      DATE <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.outwardDate}
                      onChange={(e) => setFormState({ ...formState, outwardDate: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      TRASNPORTER NAME <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={formState.transporterName}
                      onChange={(e) => setFormState({ ...formState, transporterName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      VEHICLE NO.
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={formState.vehicleNo}
                      onChange={(e) => setFormState({ ...formState, vehicleNo: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* PRODUCTS & QUANTITIES - STRICTLY MANUAL ENTRY */}
                  <div style={{
                    gridColumn: isMobile ? '1' : 'span 2',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: isMobile ? '12px' : '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Boxes size={15} style={{ color: '#0284c7' }} />
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                          PRODUCTS & QUANTITIES <span style={{ color: '#e11d48' }}>*</span>
                        </label>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          ({formState.items.length} {formState.items.length === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Total Qty:</span>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          fontWeight: '800',
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {formatQuantity(formState.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0))}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formState.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          style={{
                            background: '#ffffff',
                            padding: isMobile ? '10px' : '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          {isMobile ? (
                            /* Mobile Stacked Layout */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                                  PRODUCT #{idx + 1}
                                </label>
                                <input
                                  type="text"
                                  required
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  placeholder={idx === 0 ? "Material description / grade" : "Material / product name"}
                                  value={it.productName}
                                  onChange={(e) => handleUpdateItem(idx, { productName: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                                    QUANTITY
                                  </label>
                                  <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    required
                                    placeholder="0.000"
                                    value={it.quantity}
                                    onChange={(e) => handleUpdateItem(idx, { quantity: e.target.value })}
                                    style={{
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      fontSize: '13px',
                                      outline: 'none',
                                      fontFamily: 'monospace',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                                <div style={{ width: '95px' }}>
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                                    UNIT
                                  </label>
                                  <select
                                    value={it.unit || 'Sets'}
                                    onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                                    style={{
                                      width: '100%',
                                      padding: '8px 6px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      fontSize: '12px',
                                      outline: 'none',
                                      background: '#ffffff',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    <option value="Sets">Sets</option>
                                    <option value="Nos">Nos</option>
                                    <option value="Pcs">Pcs</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Mtr">Mtr</option>
                                    <option value="Boxes">Boxes</option>
                                  </select>
                                </div>
                                <div style={{ width: '36px', display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
                                  {formState.items.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      title="Remove item"
                                      style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ef4444',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  ) : (
                                    <span style={{ width: '32px', height: '32px' }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Desktop Grid Layout */
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0, 1fr) 130px 95px 36px',
                              gap: '8px',
                              alignItems: 'center'
                            }}>
                              <div>
                                <input
                                  type="text"
                                  required
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  placeholder={idx === 0 ? "Material description / grade" : "Material / product name"}
                                  value={it.productName}
                                  onChange={(e) => handleUpdateItem(idx, { productName: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>

                              <div>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0.001"
                                  required
                                  placeholder="0.000"
                                  value={it.quantity}
                                  onChange={(e) => handleUpdateItem(idx, { quantity: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>

                              <div>
                                <select
                                  value={it.unit || 'Sets'}
                                  onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '8px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px',
                                    outline: 'none',
                                    background: '#ffffff',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <option value="Sets">Sets</option>
                                  <option value="Nos">Nos</option>
                                  <option value="Pcs">Pcs</option>
                                  <option value="Kg">Kg</option>
                                  <option value="Mtr">Mtr</option>
                                  <option value="Boxes">Boxes</option>
                                </select>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {formState.items.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    title="Remove item"
                                    style={{
                                      background: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      width: '32px',
                                      height: '32px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#ef4444',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                ) : (
                                  <span style={{ width: '32px', height: '32px' }} />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px dashed #0284c7',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={13} />
                        Add Another Product
                      </button>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Enter manual material description and quantities
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      PARTY NAME <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={formState.partyName}
                      onChange={(e) => setFormState({ ...formState, partyName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      SALES PERSON
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={formState.salesPerson}
                      onChange={(e) => setFormState({ ...formState, salesPerson: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      INVOICE NO
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={formState.invoiceNo}
                      onChange={(e) => setFormState({ ...formState, invoiceNo: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      RECEIVING MANUALLY
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={formState.receivingManually}
                      onChange={(e) => setFormState({ ...formState, receivingManually: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      REMARK
                    </label>
                    <textarea
                      rows={2}
                      value={formState.remark}
                      onChange={(e) => setFormState({ ...formState, remark: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Always pinned at bottom */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: isMobile ? '12px 16px' : '14px 22px',
                borderTop: '1px solid #f1f5f9',
                background: '#ffffff',
                flexShrink: 0
              }}>
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
                  {formSubmitting ? 'Updating...' : 'Update Outward Entry'}
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
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '8px' : '20px 16px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: isMobile ? '14px' : '16px',
            maxWidth: '620px',
            width: '100%',
            margin: 'auto 0',
            maxHeight: isMobile ? '96vh' : 'calc(100vh - 40px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header - Always pinned at top */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '12px 16px' : '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#f0f9ff', color: '#0284c7' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Outward Register Details</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>SR NO: {selectedRecord.srNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Details Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0, overflowY: 'auto', padding: isMobile ? '14px 16px' : '18px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Date</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{formatDate(selectedRecord.outwardDate)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Quantity</span>
                  <span style={{ fontWeight: '700', color: '#0284c7', fontFamily: 'monospace', fontSize: '14px' }}>
                    {formatQuantity(selectedRecord.quantity)}
                  </span>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Party Name</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{selectedRecord.partyName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>TRASNPORTER NAME</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{selectedRecord.transporterName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Vehicle No.</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>{selectedRecord.vehicleNo || '—'}</span>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : 'span 2', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Boxes size={14} style={{ color: '#0284c7' }} />
                      <span style={{ fontSize: '11px', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Product-Wise Dispatch Items
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      Total Qty: {formatQuantity(selectedRecord.quantity)}
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px', width: '32px' }}>#</th>
                          <th style={{ padding: '6px 8px' }}>Product Name / Description</th>
                          <th style={{ padding: '6px 8px', textAlign: 'right', width: '110px' }}>Quantity</th>
                          <th style={{ padding: '6px 8px', width: '60px' }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedRecord.items && selectedRecord.items.length > 0 ? selectedRecord.items : [{ productName: selectedRecord.material, quantity: selectedRecord.quantity, unit: 'Sets' }]).map((it: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '700' }}>{i + 1}</td>
                            <td style={{ padding: '6px 8px', fontWeight: '600', color: '#0f172a' }}>{it.productName || it.product || selectedRecord.material}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#0284c7' }}>{formatQuantity(it.quantity)}</td>
                            <td style={{ padding: '6px 8px', color: '#64748b' }}>{it.unit || 'Sets'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Sales Person</span>
                  <span style={{ fontWeight: '600', color: '#475569' }}>{selectedRecord.salesPerson || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Invoice No</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>{selectedRecord.invoiceNo || '—'}</span>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>RECEIVING MANUALLY</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 9px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      marginTop: '4px',
                      ...getReceivingBadgeStyle(selectedRecord.receivingManually)
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: getReceivingDotColor(selectedRecord.receivingManually) }} />
                    {selectedRecord.receivingManually || '—'}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Remark</span>
                <p style={{ margin: 0, padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', lineHeight: '1.5' }}>
                  {selectedRecord.remark || 'No remark entered.'}
                </p>
              </div>
            </div>

            {/* Footer - Always pinned at bottom */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: isMobile ? '12px 16px' : '14px 22px', borderTop: '1px solid #e2e8f0', background: '#ffffff', flexShrink: 0 }}>
              <button
                type="button"
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

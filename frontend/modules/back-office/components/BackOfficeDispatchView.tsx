'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Calendar,
  Search,
  RefreshCw,
  Download,
  Copy,
  CheckCircle2,
  Eye,
  X,
  ExternalLink,
  User,
  ShieldCheck,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchConfirmedDispatches } from '../services/backOfficeDispatchService';
import { getBackendAssetUrl, downloadAssetFile } from '@/lib/assetUrl';

export interface DispatchedCargoItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
}

export interface ConfirmedDispatchRecord {
  id: string;
  dispatchNo: string;
  salesOrderId: string;
  salesOrderNumber: string;
  dispatchCategory: 'D1' | 'D2';
  status: string;
  customerName: string;
  consigneeAddress: string;
  salesPerson: string;
  salesPersonEmail: string | null;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  transporterName: string;
  lrNumber: string;
  invoiceNumber: string;
  challanNumber: string;
  dispatchedAt: string;
  deliveredAt: string | null;
  receivedBy: string;
  receiverPhone: string;
  deliveryRemarks: string;
  podUrl: string | null;
  podStatus: string;
  totalWeight: number | null;
  freightAmount: number | null;
  packageCount: number | null;
  documentChecklist?: any;
  items: DispatchedCargoItem[];
}

export interface ConfirmedDispatchesResponse {
  items: ConfirmedDispatchRecord[];
  counts: {
    D1: number;
    D2: number;
    total: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filter: {
    tab: 'D1' | 'D2';
    dateFilter: string;
    startDate: string | null;
    endDate: string | null;
    search: string;
  };
}

export default function BackOfficeDispatchView() {
  // Active Tab: 'D1' | 'D2'
  const [activeTab, setActiveTab] = useState<'D1' | 'D2'>('D1');

  // Filter States
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'this_month' | 'all' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedCustomStart, setAppliedCustomStart] = useState('');
  const [appliedCustomEnd, setAppliedCustomEnd] = useState('');
  const [search, setSearch] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  // Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ConfirmedDispatchRecord[]>([]);
  const [counts, setCounts] = useState({ D1: 0, D2: 0, total: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });

  // Modal States
  const [selectedDispatch, setSelectedDispatch] = useState<ConfirmedDispatchRecord | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Format date display (DD-MM-YYYY HH:mm)
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch {
      return String(dateStr);
    }
  };

  // Fetch confirmed dispatches
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        tab: activeTab,
        dateFilter,
        page,
        limit,
      };

      if (dateFilter === 'custom') {
        if (appliedCustomStart) params.startDate = appliedCustomStart;
        if (appliedCustomEnd) params.endDate = appliedCustomEnd;
      }

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const res = (await fetchConfirmedDispatches(params)) as ConfirmedDispatchesResponse;
      if (res) {
        setItems(res.items || []);
        if (res.counts) setCounts(res.counts);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load confirmed dispatches:', err);
      setError('Unable to load confirmed dispatches from server. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFilter, appliedCustomStart, appliedCustomEnd, search, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab switch
  const handleTabChange = (tab: 'D1' | 'D2') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
  };

  // Date filter change
  const handleDateFilterChange = (filter: 'today' | 'yesterday' | 'this_month' | 'all' | 'custom') => {
    setDateFilter(filter);
    setPage(1);
    if (filter !== 'custom') {
      setAppliedCustomStart('');
      setAppliedCustomEnd('');
    }
  };

  // Apply custom date range
  const handleApplyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both From Date and To Date');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('From Date cannot be after To Date');
      return;
    }
    setAppliedCustomStart(startDate);
    setAppliedCustomEnd(endDate);
    setPage(1);
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      toast.info('Preparing CSV manifest...');
      const params: Record<string, any> = {
        tab: activeTab,
        dateFilter,
        exportAll: true,
        limit: -1,
      };
      if (dateFilter === 'custom') {
        if (appliedCustomStart) params.startDate = appliedCustomStart;
        if (appliedCustomEnd) params.endDate = appliedCustomEnd;
      }
      if (search && search.trim()) params.search = search.trim();

      const res = (await fetchConfirmedDispatches(params)) as ConfirmedDispatchesResponse;
      const exportItems = res?.items || items;

      if (!exportItems.length) {
        toast.error('No records available to export');
        return;
      }

      const headers = [
        'Dispatch #',
        'Sales Order',
        'Customer',
        'Consignee Address',
        'Invoice #',
        'Challan #',
        'Sales Person',
        'Driver',
        'Vehicle',
        'Dispatched Date',
        'Delivered Date',
        'Status',
      ];

      const rows = exportItems.map((d) => [
        `"${String(d.dispatchNo || '').replace(/"/g, '""')}"`,
        `"${String(d.salesOrderNumber || '').replace(/"/g, '""')}"`,
        `"${String(d.customerName || '').replace(/"/g, '""')}"`,
        `"${String(d.consigneeAddress || '').replace(/"/g, '""')}"`,
        `"${String(d.invoiceNumber || '').replace(/"/g, '""')}"`,
        `"${String(d.challanNumber || '').replace(/"/g, '""')}"`,
        `"${String(d.salesPerson || '—').replace(/"/g, '""')}"`,
        `"${String(d.driverName || '').replace(/"/g, '""')}"`,
        `"${String(d.vehicleNumber || '').replace(/"/g, '""')}"`,
        `"${String(formatDateTime(d.dispatchedAt)).replace(/"/g, '""')}"`,
        `"${String(formatDateTime(d.deliveredAt)).replace(/"/g, '""')}"`,
        `"${String(d.status || 'DELIVERED').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BackOffice_Dispatch_${activeTab}_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV manifest exported successfully!');
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div style={{ padding: '24px 32px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* ─── 1. TOP HEADER ─── */}
      <div style={{ marginBottom: '20px' }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}
        >
          <span>BACK OFFICE</span>
          <span>/</span>
          <span style={{ color: '#2563eb' }}>Dispatch</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#0f172a',
                margin: '0 0 4px 0',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'inline-flex',
                }}
              >
                <Truck size={20} />
              </div>
              Dispatch
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Confirmed dispatch records from Dispatch 1 and Dispatch 2
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => loadData()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                transition: 'all 0.15s',
              }}
            >
              <Download size={14} />
              <span>Export Manifest CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. TWO TABS: DISPATCH 1 & DISPATCH 2 ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('D1')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'D1' ? '#2563eb' : '#fff',
            color: activeTab === 'D1' ? '#fff' : '#475569',
            boxShadow: activeTab === 'D1' ? '0 2px 4px rgba(37, 99, 235, 0.25)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <Truck size={16} />
          <span>Dispatch 1</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '700',
              background: activeTab === 'D1' ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
              color: activeTab === 'D1' ? '#fff' : '#334155',
            }}
          >
            {counts.D1}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('D2')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'D2' ? '#2563eb' : '#fff',
            color: activeTab === 'D2' ? '#fff' : '#475569',
            boxShadow: activeTab === 'D2' ? '0 2px 4px rgba(37, 99, 235, 0.25)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <Layers size={16} />
          <span>Dispatch 2</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '700',
              background: activeTab === 'D2' ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
              color: activeTab === 'D2' ? '#fff' : '#334155',
            }}
          >
            {counts.D2}
          </span>
        </button>
      </div>

      {/* ─── 3. CONTROLS TOOLBAR: DATE FILTER & SEARCH ─── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Date Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginRight: '4px' }}>
              Date Filter:
            </span>

            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_month', label: 'This Month' },
              { id: 'all', label: 'All' },
              { id: 'custom', label: 'Custom Date Range' },
            ].map((f) => {
              const isActive = dateFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleDateFilterChange(f.id as any)}
                  style={{
                    padding: '6px 13px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    borderRadius: '7px',
                    border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                    background: isActive ? '#eff6ff' : '#fff',
                    color: isActive ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search dispatch, SO, customer, invoice, driver, vehicle, sales person..."
              style={{
                width: '100%',
                padding: '8px 32px 8px 34px',
                fontSize: '12.5px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                outline: 'none',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Controls (shown when dateFilter === 'custom') */}
        {dateFilter === 'custom' && (
          <form
            onSubmit={handleApplyCustomDate}
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>From Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  padding: '6px 10px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>To Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{
                  padding: '6px 10px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '6px 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>

            {appliedCustomStart && appliedCustomEnd && (
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                ✓ Applied: {appliedCustomStart} to {appliedCustomEnd}
              </span>
            )}
          </form>
        )}
      </div>

      {/* ─── 4. MAIN TABLE / CARD ─── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Loading State */}
        {loading && (
          <div
            style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: '#64748b',
            }}
          >
            <RefreshCw size={24} className="animate-spin" style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Loading confirmed dispatches...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', marginBottom: '8px' }}>
              <ShieldCheck size={32} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
              Failed to Load Dispatches
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>{error}</p>
            <button
              type="button"
              onClick={() => loadData()}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <Truck size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
              {search
                ? 'No matching dispatches found'
                : dateFilter === 'today'
                ? 'No confirmed dispatches recorded today'
                : `No confirmed records found in ${activeTab === 'D1' ? 'Dispatch 1' : 'Dispatch 2'}`}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 16px' }}>
              {search
                ? `No dispatches match "${search}". Try adjusting your search query.`
                : dateFilter === 'today'
                ? "There are no dispatches confirmed today yet. Try selecting 'This Month' or 'All' to view historical dispatches."
                : 'Confirmed deliveries will appear here automatically as dispatches are marked delivered.'}
            </p>

            {dateFilter === 'today' && (
              <button
                type="button"
                onClick={() => handleDateFilterChange('this_month')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Calendar size={14} />
                <span>View This Month's Dispatches</span>
              </button>
            )}
          </div>
        )}

        {/* ─── 5. CONFIRMED DISPATCH TABLE ─── */}
        {!loading && !error && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr
                  style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '12px 16px', width: '140px' }}>Dispatch #</th>
                  <th style={{ padding: '12px 14px', width: '140px' }}>Sales Order</th>
                  <th style={{ padding: '12px 16px', minWidth: '220px' }}>Customer &amp; Consignee</th>
                  <th style={{ padding: '12px 14px', width: '160px' }}>Invoice / Challan</th>
                  <th style={{ padding: '12px 14px', width: '150px' }}>Sales Person</th>
                  <th style={{ padding: '12px 14px', width: '160px' }}>Driver &amp; Vehicle</th>
                  <th style={{ padding: '12px 14px', width: '150px' }}>Dispatched Date</th>
                  <th style={{ padding: '12px 14px', width: '110px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', width: '100px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={d.id}
                      style={{
                        background: isEven ? '#fff' : '#fcfdfd',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s',
                      }}
                    >
                      {/* 1. Dispatch # */}
                      <td style={{ padding: '12px 16px' }}>
                        <div
                          onClick={() => copyToClipboard(d.dispatchNo)}
                          title="Click to copy Dispatch #"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            color: '#1d4ed8',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                          }}
                        >
                          <Truck size={12} />
                          <span>#{d.dispatchNo}</span>
                          {copiedText === d.dispatchNo ? (
                            <CheckCircle2 size={11} color="#16a34a" />
                          ) : (
                            <Copy size={11} color="#94a3b8" />
                          )}
                        </div>
                      </td>

                      {/* 2. Sales Order */}
                      <td style={{ padding: '12px 14px' }}>
                        <div
                          onClick={() => copyToClipboard(d.salesOrderNumber)}
                          title="Click to copy Sales Order #"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            color: '#334155',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                          }}
                        >
                          <span>#{d.salesOrderNumber}</span>
                        </div>
                      </td>

                      {/* 3. Customer & Consignee */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                            {d.customerName}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '240px',
                            }}
                            title={d.consigneeAddress}
                          >
                            {d.consigneeAddress}
                          </span>
                        </div>
                      </td>

                      {/* 4. Invoice / Challan */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: '700',
                              color: '#1e293b',
                              fontFamily: 'monospace',
                            }}
                          >
                            Inv: {d.invoiceNumber}
                          </span>
                          {d.challanNumber && d.challanNumber !== '—' && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              Chn: {d.challanNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Sales Person (Dedicated Column) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '12px',
                              background: d.salesPerson !== '—' ? '#f0fdf4' : '#f1f5f9',
                              color: d.salesPerson !== '—' ? '#16a34a' : '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10.5px',
                              fontWeight: '700',
                            }}
                          >
                            <User size={12} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span
                              style={{
                                fontWeight: '700',
                                color: d.salesPerson !== '—' ? '#0f172a' : '#94a3b8',
                              }}
                            >
                              {d.salesPerson}
                            </span>
                            {d.salesPersonEmail && (
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {d.salesPersonEmail.split('@')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 6. Driver & Vehicle */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{d.driverName}</span>
                          {d.vehicleNumber && d.vehicleNumber !== '—' && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              {d.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Dispatched Date */}
                      <td style={{ padding: '12px 14px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#334155',
                            fontSize: '12px',
                          }}
                        >
                          <Calendar size={12} color="#64748b" />
                          <span>{formatDateTime(d.dispatchedAt)}</span>
                        </div>
                      </td>

                      {/* 8. Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            background: '#dcfce7',
                            border: '1px solid #86efac',
                            color: '#15803d',
                            fontSize: '11px',
                            fontWeight: '700',
                          }}
                        >
                          <CheckCircle2 size={11} />
                          Delivered
                        </span>
                      </td>

                      {/* 9. Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDispatch(d)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            color: '#0f172a',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.1s',
                          }}
                        >
                          <Eye size={12} color="#2563eb" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── 6. PAGINATION BAR ─── */}
        {!loading && !error && pagination.totalItems > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12.5px',
              color: '#475569',
            }}
          >
            <div>
              Showing{' '}
              <span style={{ fontWeight: '700', color: '#0f172a' }}>
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span style={{ fontWeight: '700', color: '#0f172a' }}>
                {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
              </span>{' '}
              of <span style={{ fontWeight: '700', color: '#0f172a' }}>{pagination.totalItems}</span> dispatches
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: pagination.page <= 1 ? '#f1f5f9' : '#fff',
                  color: pagination.page <= 1 ? '#94a3b8' : '#334155',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>

              <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: '700' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: pagination.page >= pagination.totalPages ? '#f1f5f9' : '#fff',
                  color: pagination.page >= pagination.totalPages ? '#94a3b8' : '#334155',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 7. READ-ONLY CONSIGNMENT DETAILS MODAL ─── */}
      {selectedDispatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedDispatch(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#2563eb', color: '#fff', padding: '8px', borderRadius: '8px' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Consignment #{selectedDispatch.dispatchNo}
                    </h2>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}
                    >
                      DELIVERED
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}
                    >
                      {selectedDispatch.dispatchCategory === 'D2' ? 'Dispatch 2' : 'Dispatch 1'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Sales Order: #{selectedDispatch.salesOrderNumber} · Dispatched:{' '}
                    {formatDateTime(selectedDispatch.dispatchedAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                style={{
                  border: 'none',
                  background: '#e2e8f0',
                  color: '#475569',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Customer & Sales Person Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Customer / Consignee
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {selectedDispatch.customerName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    {selectedDispatch.consigneeAddress}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Sales Person
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {selectedDispatch.salesPerson}
                  </div>
                  {selectedDispatch.salesPersonEmail && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {selectedDispatch.salesPersonEmail}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    Commercial Invoicing
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    Invoice: {selectedDispatch.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    Challan: {selectedDispatch.challanNumber}
                  </div>
                </div>
              </div>

              {/* Section 2: Transport & Fleet Logistics */}
              <div>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    margin: '0 0 10px 0',
                  }}
                >
                  Logistics &amp; Carrier Details
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    fontSize: '12.5px',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Driver Name</div>
                    <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                      {selectedDispatch.driverName}
                    </div>
                    {selectedDispatch.driverPhone !== '—' && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedDispatch.driverPhone}</div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Vehicle Number</div>
                    <div
                      style={{
                        fontWeight: '700',
                        color: '#0f172a',
                        marginTop: '2px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedDispatch.vehicleNumber}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      Transporter / Fleet
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                      {selectedDispatch.transporterName}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      LR / Consignment #
                    </div>
                    <div
                      style={{
                        fontWeight: '700',
                        color: '#0f172a',
                        marginTop: '2px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedDispatch.lrNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Dispatched Cargo Items */}
              <div>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    margin: '0 0 10px 0',
                  }}
                >
                  Dispatched Cargo Items
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr
                        style={{
                          background: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          color: '#475569',
                          fontWeight: '700',
                        }}
                      >
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item Description</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', width: '140px' }}>SKU</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', width: '120px' }}>
                          Dispatched Qty
                        </th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', width: '80px' }}>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDispatch.items?.length > 0 ? (
                        selectedDispatch.items.map((it) => (
                          <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0f172a' }}>
                              {it.productName}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#64748b', fontFamily: 'monospace' }}>
                              {it.sku}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                textAlign: 'right',
                                fontWeight: '700',
                                color: '#0f172a',
                              }}
                            >
                              {it.quantity}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#64748b' }}>{it.unit}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                            Standard Consignment Cargo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Proof of Delivery (POD) & Verification */}
              <div>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    margin: '0 0 10px 0',
                  }}
                >
                  Proof of Delivery (POD) &amp; Receiver Verification
                </h4>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Received By</div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedDispatch.receivedBy}</div>
                      {selectedDispatch.receiverPhone !== '—' && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Phone: {selectedDispatch.receiverPhone}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        Delivery Remarks
                      </div>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        {selectedDispatch.deliveryRemarks || 'Confirmed in good condition'}
                      </div>
                    </div>
                  </div>

                  {/* POD Document Preview */}
                  <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                    {selectedDispatch.podUrl ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              padding: '6px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              borderRadius: '6px',
                            }}
                          >
                            <FileCheck2 size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a' }}>
                              Proof of Delivery Document Attached
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Status: {selectedDispatch.podStatus} · Delivered{' '}
                              {formatDateTime(selectedDispatch.deliveredAt)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const assetUrl = getBackendAssetUrl(selectedDispatch.podUrl);
                              window.open(assetUrl, '_blank');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#334155',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <ExternalLink size={13} />
                            <span>Open Full Document</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (selectedDispatch.podUrl) {
                                const filename = `POD_${selectedDispatch.dispatchNo}.jpg`;
                                downloadAssetFile(selectedDispatch.podUrl, filename);
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#2563eb',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            <Download size={13} />
                            <span>Download POD</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                        No POD available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
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

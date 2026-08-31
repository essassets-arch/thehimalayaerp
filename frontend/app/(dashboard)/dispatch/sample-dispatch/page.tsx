'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  PackageOpen,
  ArrowRight,
  Truck,
  CheckCircle,
  Upload,
  Plus,
  User,
  MapPin,
  Search,
  RefreshCw,
  Clock,
  Layers,
  Edit3,
  FileCheck,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { backendFetch } from '@/lib/backendFetch';
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchTableCard,
  SalesOrderNumberBadge,
  DispatchQuantityBadge,
} from '../components';

interface SampleDispatchItem {
  id: string;
  cleanId: string;
  orderNo: string;
  customer: string;
  address: string;
  product: string;
  approvedQty: number;
  status: 'pending' | 'in-transit' | 'delivered';
  rawStatus: string;
  isReturn: boolean;
  deliveryState: string;
  transporter?: string;
  vehicleNo?: string;
  driverName?: string;
  dispatchDate?: string;
  proofOfDelivery?: string;
}

function SampleDispatchListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<SampleDispatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Upload POD modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingSampleId, setUploadingSampleId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // View POD modal state
  const [viewPodUrl, setViewPodUrl] = useState<string | null>(null);

  // Sync state with URL parameter ?status=xxx
  useEffect(() => {
    const statusParam = searchParams?.get('status');
    if (statusParam && ['pending', 'in-transit', 'delivered', 'all'].includes(statusParam)) {
      setFilter(statusParam);
    }
  }, [searchParams]);

  // Fetch real samples from the backend
  const loadSamples = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await backendFetch<any[]>('/api/backend/sales/samples', { cacheTtlMs: 0 });
      const dataArray = Array.isArray(res) ? res : (res as any)?.data || [];

      const mappedList: SampleDispatchItem[] = dataArray.map((sample: any) => {
        const rawStatus = String(sample.status || '').toUpperCase();
        const rawDispatch = String(sample.dispatchStatus || '').toUpperCase();

        const isReturn =
          rawStatus === 'RETURN_REQUESTED' ||
          rawStatus === 'RETURN_IN_TRANSIT' ||
          rawStatus === 'RETURNED' ||
          sample.retrievalStatus === 'Requested' ||
          sample.retrievalStatus === 'In Transit' ||
          sample.retrievalStatus === 'Retrieved';

        let categorizedStatus: 'pending' | 'in-transit' | 'delivered' = 'pending';
        let deliveryState = 'Not Started';

        if (
          rawStatus === 'DELIVERED' ||
          rawDispatch === 'DELIVERED' ||
          rawStatus === 'APPROVED' ||
          rawStatus === 'UNDER_TESTING' ||
          rawStatus === 'EVALUATION_ACTIVE' ||
          rawStatus === 'RETURNED' ||
          rawStatus === 'COMPLETED' ||
          Boolean(sample.deliveredAt) ||
          Boolean(sample.deliveredDate)
        ) {
          categorizedStatus = 'delivered';
          deliveryState = isReturn ? 'Returned' : 'Delivered';
        } else if (
          rawStatus === 'DISPATCHED' ||
          rawStatus === 'IN_TRANSIT' ||
          rawStatus === 'RETURN_IN_TRANSIT' ||
          rawDispatch === 'IN TRANSIT' ||
          Boolean(sample.dispatchDate)
        ) {
          categorizedStatus = 'in-transit';
          deliveryState = isReturn ? 'Return In Transit' : 'Out for Delivery';
        } else {
          categorizedStatus = 'pending';
          deliveryState = isReturn ? 'Pick-up Requested' : 'Pending Dispatch';
        }

        const primaryItem = sample.items?.[0] || sample.products?.[0];
        const productName =
          sample.product ||
          sample.productName ||
          primaryItem?.product?.name ||
          primaryItem?.specifications ||
          'Sample Product';

        const totalQty =
          Number(sample.quantity) ||
          (sample.items || []).reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0) ||
          1;

        const customerName =
          sample.customer ||
          sample.customerName ||
          sample.leadName ||
          sample.lead?.companyName ||
          sample.customer?.companyName ||
          'Customer';

        const address =
          sample.address ||
          sample.deliveryAddress ||
          sample.lead?.address ||
          sample.customer?.address ||
          'See Lead/Customer address';

        return {
          id: `req-${sample.id}`,
          cleanId: sample.id,
          orderNo: sample.sampleNumber || sample.sampleId || `SMP-${String(sample.id).slice(0, 6)}`,
          customer: customerName,
          address,
          product: productName,
          approvedQty: totalQty,
          status: categorizedStatus,
          rawStatus,
          isReturn,
          deliveryState,
          transporter: sample.transportMode || sample.dispatchDetails?.transport,
          vehicleNo: sample.vehicleNo || sample.dispatchDetails?.vehicleNo,
          driverName: sample.driverName || sample.dispatchDetails?.driverName,
          dispatchDate: sample.dispatchDate || sample.dispatchDetails?.dispatchDate,
          proofOfDelivery: sample.proofOfDelivery || sample.podImage || sample.dispatchDetails?.proofOfDelivery || undefined,
        };
      });

      setRequests(mappedList);
    } catch (err) {
      console.warn('Failed to fetch live sample requests from backend:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSamples();
  }, []);

  const setUrlFilter = (newFilter: string) => {
    setFilter(newFilter);
    router.push(`/dispatch/sample-dispatch?status=${newFilter}`);
  };

  // State transitions: Directly confirm delivery
  const updateDeliveryState = async (id: string, newState: 'Delivered' | 'Started') => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;

    setActionInProgress(id);
    try {
      if (newState === 'Delivered') {
        await backendFetch(`/api/backend/sales/samples/${target.cleanId}`, {
          method: 'PATCH',
          body: {
            status: target.isReturn ? 'RETURNED' : 'DELIVERED',
            deliveredAt: new Date().toISOString(),
          },
        });
        toast.success(target.isReturn ? 'Sample returned successfully!' : 'Sample delivery confirmed successfully!');
        await loadSamples(true);
        setUrlFilter('delivered');
      } else if (newState === 'Started') {
        await backendFetch(`/api/backend/sales/samples/${target.cleanId}`, {
          method: 'PATCH',
          body: {
            status: target.isReturn ? 'RETURN_IN_TRANSIT' : 'DISPATCHED',
          },
        });
        toast.success('Consignment marked in transit!');
        await loadSamples(true);
      }
    } catch (e: any) {
      console.error('Failed to update delivery state:', e);
      toast.error(e?.message || 'Failed to update delivery status');
    } finally {
      setActionInProgress(null);
    }
  };

  const openUploadModal = (id: string) => {
    setUploadingSampleId(id);
    setUploadModalOpen(true);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadingSampleId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const confirmUpload = async () => {
    if (!selectedFile || !uploadingSampleId) return;

    const target = requests.find((r) => r.id === uploadingSampleId);
    if (!target) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      await backendFetch(`/api/backend/sales/samples/${target.cleanId}`, {
        method: 'PATCH',
        body: {
          proofOfDelivery: base64Data,
          status: 'COMPLETED',
        },
      });

      toast.success('Proof of delivery uploaded successfully!');
      closeUploadModal();
      await loadSamples(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to upload proof of delivery');
    } finally {
      setUploading(false);
    }
  };

  // Dynamic live counts for tabs
  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);
  const inTransitCount = useMemo(() => requests.filter((r) => r.status === 'in-transit').length, [requests]);
  const deliveredCount = useMemo(() => requests.filter((r) => r.status === 'delivered').length, [requests]);
  const allCount = requests.length;

  // Filtered and searched data
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesFilter = filter === 'all' ? true : req.status === filter;
      if (!matchesFilter) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        req.orderNo.toLowerCase().includes(q) ||
        req.customer.toLowerCase().includes(q) ||
        req.product.toLowerCase().includes(q) ||
        req.address.toLowerCase().includes(q) ||
        (req.vehicleNo && req.vehicleNo.toLowerCase().includes(q)) ||
        (req.transporter && req.transporter.toLowerCase().includes(q))
      );
    });
  }, [requests, filter, search]);

  return (
    <DispatchPageShell>
      {/* ── Page Header ── */}
      <DispatchPageHeader
        title="Sample Dispatch & Logistics"
        description="Manage commercial sample dispatch pipelines, driver assignments, vehicle consignments, and live delivery proofs."
        eyebrow="Logistics Operations"
        icon={PackageOpen}
        stats={[
          {
            label: 'Pending Dispatch',
            value: pendingCount,
            icon: Clock,
            color: 'bg-amber-50 text-amber-700',
          },
          {
            label: 'In-Transit',
            value: inTransitCount,
            icon: Truck,
            color: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Delivered',
            value: deliveredCount,
            icon: CheckCircle,
            color: 'bg-emerald-50 text-emerald-700',
          },
        ]}
      />

      {/* ── Dynamic Tab Sub-Navigation & Actions Toolbar ── */}
      <div
        style={{
          width: '100%',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setUrlFilter('pending')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: filter === 'pending' ? 700 : 600,
                border: filter === 'pending' ? '1px solid #f59e0b' : '1px solid transparent',
                background: filter === 'pending' ? '#fef3c7' : '#f8fafc',
                color: filter === 'pending' ? '#92400e' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Clock size={15} />
              Pending Dispatch
              <span
                style={{
                  background: filter === 'pending' ? '#f59e0b' : '#e2e8f0',
                  color: filter === 'pending' ? '#ffffff' : '#475569',
                  padding: '1px 7px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setUrlFilter('in-transit')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: filter === 'in-transit' ? 700 : 600,
                border: filter === 'in-transit' ? '1px solid #3b82f6' : '1px solid transparent',
                background: filter === 'in-transit' ? '#eff6ff' : '#f8fafc',
                color: filter === 'in-transit' ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Truck size={15} />
              In Transit
              <span
                style={{
                  background: filter === 'in-transit' ? '#3b82f6' : '#e2e8f0',
                  color: filter === 'in-transit' ? '#ffffff' : '#475569',
                  padding: '1px 7px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {inTransitCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setUrlFilter('delivered')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: filter === 'delivered' ? 700 : 600,
                border: filter === 'delivered' ? '1px solid #10b981' : '1px solid transparent',
                background: filter === 'delivered' ? '#ecfdf5' : '#f8fafc',
                color: filter === 'delivered' ? '#047857' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <CheckCircle size={15} />
              Delivered
              <span
                style={{
                  background: filter === 'delivered' ? '#10b981' : '#e2e8f0',
                  color: filter === 'delivered' ? '#ffffff' : '#475569',
                  padding: '1px 7px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {deliveredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setUrlFilter('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: filter === 'all' ? 700 : 600,
                border: filter === 'all' ? '1px solid #64748b' : '1px solid transparent',
                background: filter === 'all' ? '#f1f5f9' : '#f8fafc',
                color: filter === 'all' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Layers size={15} />
              All
              <span
                style={{
                  background: filter === 'all' ? '#475569' : '#e2e8f0',
                  color: filter === 'all' ? '#ffffff' : '#475569',
                  padding: '1px 7px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {allCount}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => loadSamples(true)}
              disabled={refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>

            <Link
              href="/dispatch/sample-dispatch/create/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              <Plus size={15} />
              Create Sample Dispatch
            </Link>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
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
            placeholder="Search by Sample No, Customer, Product, Transporter or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              background: '#f8fafc',
              color: '#0f172a',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* ── Desktop Data Table (>= 768px) ── */}
      <div className="hidden md:block">
        <DispatchTableCard minTableWidth={1000}>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="dsp-th">Sample Order</th>
                <th className="dsp-th">Customer</th>
                <th className="dsp-th">Delivery Address</th>
                <th className="dsp-th">Product</th>
                <th className="dsp-th text-center">Approved Qty</th>
                <th className="dsp-th">Logistics Status</th>
                <th className="dsp-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin inline mr-2" /> Loading live sample consignments...
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const isBusy = actionInProgress === req.id;
                  const hasProof = Boolean(req.proofOfDelivery);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="dsp-td">
                        <SalesOrderNumberBadge orderNumber={req.orderNo.replace(/^#/, '')} />
                        {req.isReturn && (
                          <span
                            style={{
                              marginLeft: 6,
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              borderRadius: 4,
                              padding: '1px 6px',
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: 0.3,
                            }}
                          >
                            ↩ RETURN
                          </span>
                        )}
                      </td>
                      <td className="dsp-td font-semibold text-slate-900">{req.customer}</td>
                      <td className="dsp-td">
                        {req.address !== 'N/A' ? (
                          <span className="text-slate-600 font-medium">{req.address}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>
                      <td className="dsp-td font-semibold text-slate-800">{req.product}</td>
                      <td className="dsp-td text-center">
                        <DispatchQuantityBadge quantity={req.approvedQty} />
                      </td>
                      <td className="dsp-td">
                        {req.status === 'pending' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                            <Clock size={12} /> Pending Dispatch
                          </span>
                        )}
                        {req.status === 'in-transit' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                            <Truck size={12} /> {req.deliveryState}
                          </span>
                        )}
                        {req.status === 'delivered' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                            <CheckCircle size={12} /> Delivered
                          </span>
                        )}
                      </td>
                      <td className="dsp-td text-right">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          {req.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                              style={{
                                background: req.isReturn ? '#dc2626' : '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '7px 14px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: req.isReturn ? '0 2px 6px rgba(220,38,38,0.25)' : '0 2px 6px rgba(37,99,235,0.25)',
                              }}
                            >
                              {req.isReturn ? '↩ Arrange Pick-up' : 'Dispatch'} <ArrowRight size={13} />
                            </button>
                          )}

                          {req.status === 'in-transit' && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => updateDeliveryState(req.id, 'Delivered')}
                                style={{
                                  background: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '7px 14px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: isBusy ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
                                  opacity: isBusy ? 0.7 : 1,
                                }}
                              >
                                <CheckCircle size={13} />
                                {isBusy ? 'Updating...' : req.isReturn ? 'Confirm Return' : 'Confirm Delivery'}
                              </button>

                              <button
                                type="button"
                                title="Edit Logistics Consignment"
                                onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                                style={{
                                  background: '#f8fafc',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '8px',
                                  padding: '7px 10px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Edit3 size={13} />
                              </button>
                            </>
                          )}

                          {req.status === 'delivered' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {hasProof ? (
                                <button
                                  type="button"
                                  onClick={() => setViewPodUrl(req.proofOfDelivery || null)}
                                  style={{
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    color: '#047857',
                                    borderRadius: '8px',
                                    padding: '7px 12px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <FileCheck size={14} color="#059669" /> Proof Attached
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => openUploadModal(req.id)}
                                style={{
                                  background: hasProof ? '#f8fafc' : '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  borderRadius: '8px',
                                  padding: '7px 14px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Upload size={13} /> {hasProof ? 'Update POD' : 'Upload Proof'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No {filter} sample dispatch requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DispatchTableCard>
      </div>

      {/* ── Mobile Cards View (< 768px) ── */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94A3B8', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <RefreshCw size={20} className="animate-spin inline mr-2" /> Loading samples...
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => {
            const isBusy = actionInProgress === req.id;
            const hasProof = Boolean(req.proofOfDelivery);
            return (
              <div key={req.id} className="dsp-card">
                {/* Card Header */}
                <div className="dsp-card-head">
                  <div className="dsp-card-head-row">
                    <SalesOrderNumberBadge orderNumber={req.orderNo.replace(/^#/, '')} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background:
                          req.status === 'pending' ? '#fef3c7' : req.status === 'in-transit' ? '#eff6ff' : '#ecfdf5',
                        color:
                          req.status === 'pending' ? '#92400e' : req.status === 'in-transit' ? '#1d4ed8' : '#047857',
                      }}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  {req.isReturn && (
                    <span
                      style={{
                        display: 'inline-block',
                        alignSelf: 'flex-start',
                        marginTop: 4,
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.3,
                      }}
                    >
                      ↩ RETURN
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="dsp-card-body">
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <User size={15} />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Customer</p>
                      <p className="dsp-card-value">{req.customer}</p>
                    </div>
                  </div>

                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <PackageOpen size={15} />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Product</p>
                      <p className="dsp-card-value">{req.product}</p>
                    </div>
                  </div>

                  {req.address && req.address !== 'N/A' && (
                    <div className="dsp-card-row">
                      <div className="dsp-card-icon">
                        <MapPin size={15} />
                      </div>
                      <div className="dsp-card-info">
                        <p className="dsp-card-label">Delivery Address</p>
                        <p className="dsp-card-value dsp-card-addr">{req.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <span className="dsp-card-label">Approved Qty</span>
                    <DispatchQuantityBadge quantity={req.approvedQty} />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="dsp-card-foot" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                      style={{
                        width: '100%',
                        background: req.isReturn ? '#dc2626' : '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{req.isReturn ? '↩ Arrange Pick-up' : 'Dispatch Consignment'}</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                  {req.status === 'in-transit' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => updateDeliveryState(req.id, 'Delivered')}
                      style={{
                        width: '100%',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        opacity: isBusy ? 0.7 : 1,
                      }}
                    >
                      <CheckCircle size={15} />
                      <span>{isBusy ? 'Updating...' : req.isReturn ? 'Confirm Return' : 'Confirm Delivery'}</span>
                    </button>
                  )}
                  {req.status === 'delivered' && (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      {hasProof ? (
                        <button
                          type="button"
                          onClick={() => setViewPodUrl(req.proofOfDelivery || null)}
                          style={{
                            flex: 1,
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#047857',
                            borderRadius: '10px',
                            padding: '10px',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Eye size={14} />
                          <span>View Proof</span>
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => openUploadModal(req.id)}
                        style={{
                          flex: 1,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '10px',
                          padding: '10px',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Upload size={15} />
                        <span>{hasProof ? 'Update POD' : 'Upload Proof'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94A3B8', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            No {filter} sample dispatch requests found.
          </div>
        )}
      </div>

      {/* ── View Proof Modal ── */}
      {viewPodUrl && (
        <div className="dsp-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setViewPodUrl(null); }}>
          <div className="dsp-modal" style={{ maxWidth: '600px' }}>
            <div className="dsp-modal-head">
              <h3 className="dsp-modal-title">Proof of Delivery (POD)</h3>
              <button onClick={() => setViewPodUrl(null)} className="dsp-modal-close">×</button>
            </div>
            <div className="dsp-modal-body" style={{ textAlign: 'center', padding: '20px' }}>
              {viewPodUrl.startsWith('data:image') || viewPodUrl.endsWith('.png') || viewPodUrl.endsWith('.jpg') || viewPodUrl.endsWith('.jpeg') ? (
                <img src={viewPodUrl} alt="Proof of Delivery" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '10px', objectFit: 'contain' }} />
              ) : (
                <iframe src={viewPodUrl} style={{ width: '100%', height: '400px', border: 'none' }} title="Document Viewer" />
              )}
            </div>
            <div className="dsp-modal-foot">
              <button onClick={() => setViewPodUrl(null)} className="dsp-btn-cancel">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Proof Modal ── */}
      {uploadModalOpen && (
        <div className="dsp-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeUploadModal(); }}>
          <div className="dsp-modal">
            <div className="dsp-modal-head">
              <h3 className="dsp-modal-title">Upload Proof of Delivery</h3>
              <button onClick={closeUploadModal} className="dsp-modal-close">×</button>
            </div>

            <div className="dsp-modal-body">
              <div className="dsp-pod-zone">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="dsp-pod-input"
                  id="pod-file-input"
                />
                <label htmlFor="pod-file-input" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {previewUrl ? (
                    <div className="dsp-pod-preview">
                      <img src={previewUrl} alt="Preview" className="dsp-pod-img" />
                      <span className="dsp-pod-replace">Click to replace image</span>
                    </div>
                  ) : (
                    <div className="dsp-pod-placeholder">
                      <Upload size={28} />
                      <span className="dsp-pod-title">Upload delivery proof image / document</span>
                      <span className="dsp-pod-hint">Click or drag image file here</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="dsp-modal-foot">
              <button onClick={closeUploadModal} className="dsp-btn-cancel" disabled={uploading}>
                Cancel
              </button>
              <button onClick={confirmUpload} disabled={!selectedFile || uploading} className="dsp-btn-confirm">
                {uploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DispatchPageShell>
  );
}

export default function SampleDispatchListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SampleDispatchListContent />
    </Suspense>
  );
}

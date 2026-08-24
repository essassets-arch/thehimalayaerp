'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PackageOpen, ArrowRight, Truck, CheckCircle, Upload, Navigation, Plus, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import styles from './sample-dispatch.module.css';

import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchTableCard,
  SalesOrderNumberBadge,
  DispatchStatusBadge,
  DispatchQuantityBadge,
} from '../components';

const INITIAL_MOCK_REQUESTS = [
  {
    id: 'req-1',
    orderNo: '#SO-2026-00007',
    customer: 'Lifecycle Customer MS4J0RRM',
    address: 'N/A',
    product: 'Lifecycle Product MS4J0RRM',
    approvedQty: 4,
    status: 'pending',
    deliveryState: 'Not Started'
  },
  {
    id: 'req-2',
    orderNo: '#SO-2026-00008',
    customer: 'Alpha Tech Solutions',
    address: '45 Industrial Park, Mumbai',
    product: 'Sample Beta Prototype X1',
    approvedQty: 10,
    status: 'in-transit',
    deliveryState: 'Not Started'
  },
  {
    id: 'req-3',
    orderNo: '#SO-2026-00009',
    customer: 'Global Logistics Corp',
    address: '112 Transport Nagar, Delhi',
    product: 'Evaluation Kit Standard',
    approvedQty: 2,
    status: 'delivered',
    deliveryState: 'Delivered'
  }
];

function SampleDispatchListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('pending');
  const [requests, setRequests] = useState(INITIAL_MOCK_REQUESTS);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingSampleId, setUploadingSampleId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync state with URL if user provides ?status=xxx
  useEffect(() => {
    const statusParam = searchParams?.get('status');
    if (statusParam && ['pending', 'in-transit', 'delivered', 'all'].includes(statusParam)) {
      setFilter(statusParam);
    }
  }, [searchParams]);

  // Fetch live samples from the backend API
  useEffect(() => {
    let isMounted = true;
    const fetchSamples = async () => {
      try {
        const { apiClient } = await import('@/lib/apiClient');
        const res = await apiClient.get('/api/backend/sales/samples');
        
        const dataArray = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        
        if (isMounted && dataArray.length > 0) {
          const liveSamples = dataArray.map((sample: any) => ({
            id: sample.id ? `req-${sample.id}` : `req-${sample.sampleId}`,
            orderNo: sample.sampleNumber || sample.sampleId || `#SMP-${sample.id}`,
            customer: sample.customer || sample.customerName || sample.companyName || sample.leadName || sample.lead?.companyName || 'Unknown Customer',
            address: sample.address || 'See Lead/Customer address',
            product: sample.product || sample.productName || sample.products?.[0]?.productName || 'Sample Product',
            approvedQty: sample.quantity || sample.products?.[0]?.quantity || 1,
            status: sample.status?.toLowerCase() === 'dispatched' || sample.status?.toLowerCase() === 'in-transit' ? 'in-transit' : 
                    sample.status?.toLowerCase() === 'delivered' ? 'delivered' : 
                    sample.status?.toLowerCase() === 'completed' ? 'completed' :
                    sample.status?.toLowerCase() === 'return_requested' ? 'pending' :
                    sample.status?.toLowerCase() === 'return_in_transit' ? 'in-transit' :
                    sample.status?.toLowerCase() === 'returned' ? 'completed' : 'pending',
            isReturn: sample.status?.toLowerCase() === 'return_requested' || 
                      sample.status?.toLowerCase() === 'return_in_transit' ||
                      sample.status?.toLowerCase() === 'returned',
            deliveryState: sample.status?.toLowerCase() === 'delivered' ? 'Delivered' :
                           sample.status?.toLowerCase() === 'return_in_transit' ? 'Return In Transit' :
                           sample.status?.toLowerCase() === 'returned' ? 'Returned' :
                           sample.status?.toLowerCase() === 'dispatched' ? 'Out for Delivery' : 'Not Started'
          }));

          setRequests(prev => {
            const prevIds = new Set(prev.map(p => p.id));
            const newLive = liveSamples.filter((s: any) => !prevIds.has(s.id));
            return [...newLive, ...prev];
          });
        }
      } catch (err) {
        console.warn('Failed to fetch live sample requests', err);
      }
    };
    fetchSamples();
    return () => { isMounted = false; };
  }, []);

  const setUrlFilter = (newFilter: string) => {
    setFilter(newFilter);
    router.push(`/dispatch/sample-dispatch?status=${newFilter}`);
  };

  const updateDeliveryState = async (id: string, newState: string) => {
    try {
      const { apiClient } = await import('@/lib/apiClient');
      const sampleId = id.replace('req-', '');
      const req = requests.find(r => r.id === id);
      const isReturn = (req as any)?.isReturn;

      if (newState === 'Started') {
        await apiClient.patch(`/api/backend/sales/samples/${sampleId}`, {
          status: isReturn ? 'RETURN_IN_TRANSIT' : 'DISPATCHED',
          deliveryState: 'Started'
        });
      } else if (newState === 'Delivered') {
        await apiClient.patch(`/api/backend/sales/samples/${sampleId}`, {
          status: isReturn ? 'RETURNED' : 'DELIVERED',
          deliveryState: isReturn ? 'Returned' : 'Delivered'
        });
      }

      setRequests(prev => prev.map(r => {
        if (r.id === id) {
          if (newState === 'Delivered') {
            return { ...r, deliveryState: isReturn ? 'Returned' : 'Delivered', status: isReturn ? 'completed' : 'delivered' };
          }
          return { ...r, deliveryState: newState, status: isReturn ? 'in-transit' : r.status };
        }
        return r;
      }));
      if (newState === 'Delivered') {
        setUrlFilter(isReturn ? 'all' : 'delivered');
      }
    } catch (e) {
      console.warn('Failed to update delivery state in backend', e);
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
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { apiClient } = await import('@/lib/apiClient');
        const sampleId = uploadingSampleId.replace('req-', '');
        await apiClient.patch(`/api/backend/sales/samples/${sampleId}`, { 
          proofOfDelivery: reader.result,
          status: 'COMPLETED'
        });
        
        setRequests(prev => prev.map(req => 
          req.id === uploadingSampleId ? { ...req, status: 'completed' } : req
        ));
        
        toast.success('Proof of delivery uploaded successfully!');
        closeUploadModal();
      } catch (err) {
        console.error(err);
        toast.error('Failed to upload proof');
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter(req => req.status === filter);

  return (
    <DispatchPageShell>
      {/* ── Page Header ── */}
      <DispatchPageHeader
        title="Sample Dispatch Requests"
        description="Manage pending requests for product samples and evaluation kits. Review approved quantities and initialize dispatch workflows."
        eyebrow="Logistics Queue"
        icon={PackageOpen}
        stats={[
          {
            label: "Pending",
            value: requests.filter(r => r.status === 'pending').length,
            icon: PackageOpen,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "In-Transit",
            value: requests.filter(r => r.status === 'in-transit').length,
            icon: Truck,
            color: "bg-indigo-50 text-indigo-600",
          }
        ]}
      >
        <button 
          onClick={() => router.push('/dispatch/sample-dispatch/create/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Plus style={{ width: 14, height: 14 }} /> Create Ad-hoc Sample
        </button>
      </DispatchPageHeader>

      {/* ── Tabs Filter Row ── */}
      <div className={styles.filters}>
        <button 
          className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setUrlFilter('pending')}
        >
          <span>📋</span> Pending Dispatch
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'in-transit' ? styles.active : ''}`}
          onClick={() => setUrlFilter('in-transit')}
        >
          <span>🚚</span> In-Transit
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'delivered' ? styles.active : ''}`}
          onClick={() => setUrlFilter('delivered')}
        >
          <span>✓</span> Delivered
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setUrlFilter('all')}
        >
          <span>🕒</span> All History
        </button>
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
                <th className="dsp-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="dsp-td">
                      <SalesOrderNumberBadge orderNumber={req.orderNo.replace(/^#/, '')} />
                      {(req as any).isReturn && (
                        <span style={{ marginLeft: 6, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 800, letterSpacing: 0.3 }}>↩ RETURN</span>
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
                    <td className="dsp-td text-right">
                      {req.status === 'pending' && (
                        <button 
                          className="dsp-confirm-btn"
                          style={(req as any).isReturn ? { background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c', width: 'auto', display: 'inline-flex', padding: '0 14px' } : { width: 'auto', display: 'inline-flex', padding: '0 14px' }}
                          onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                        >
                          {(req as any).isReturn ? '↩ Arrange Pick-up' : 'Dispatch'} <ArrowRight style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                      {req.status === 'in-transit' && (req.deliveryState === 'Not Started' || req.deliveryState === 'Out for Delivery' || req.deliveryState === 'Return In Transit') && (
                        <button 
                          className="dsp-confirm-btn"
                          style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', width: 'auto', display: 'inline-flex', padding: '0 14px' }}
                          onClick={() => updateDeliveryState(req.id, 'Started')}
                        >
                          <Navigation style={{ width: 14, height: 14 }} /> {(req as any).isReturn ? 'Start Pick-up' : 'Start Delivery'}
                        </button>
                      )}
                      {req.status === 'in-transit' && req.deliveryState === 'Started' && (
                        <button 
                          className="dsp-confirm-btn"
                          style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', width: 'auto', display: 'inline-flex', padding: '0 14px' }}
                          onClick={() => updateDeliveryState(req.id, 'Delivered')}
                        >
                          <CheckCircle style={{ width: 14, height: 14 }} /> {(req as any).isReturn ? 'Confirm Return' : 'Confirm Delivery'}
                        </button>
                      )}
                      {req.status === 'delivered' && (
                        <button 
                          className="dsp-confirm-btn"
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', width: 'auto', display: 'inline-flex', padding: '0 14px' }}
                          onClick={() => openUploadModal(req.id)}
                        >
                          <Upload style={{ width: 14, height: 14 }} /> Upload Proof
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
        {filteredRequests.length > 0 ? (
          filteredRequests.map(req => {
            const statusLabel = req.status === 'pending' ? 'PENDING' : req.status === 'in-transit' ? 'IN-TRANSIT' : 'DELIVERED';
            return (
              <div key={req.id} className="dsp-card">
                {/* Card Header */}
                <div className="dsp-card-head">
                  <div className="dsp-card-head-row">
                    <SalesOrderNumberBadge orderNumber={req.orderNo.replace(/^#/, '')} />
                    <DispatchStatusBadge status={statusLabel} />
                  </div>
                  {(req as any).isReturn && (
                    <span style={{ display: 'inline-block', alignSelf: 'flex-start', marginTop: 4, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 800, letterSpacing: 0.3 }}>
                      ↩ RETURN
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="dsp-card-body">
                  {/* Customer */}
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <User size={15} />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Customer</p>
                      <p className="dsp-card-value">{req.customer}</p>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <PackageOpen size={15} />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Product</p>
                      <p className="dsp-card-value">{req.product}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
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

                  {/* Quantity */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <span className="dsp-card-label">Approved Qty</span>
                    <DispatchQuantityBadge quantity={req.approvedQty} />
                  </div>
                </div>

                {/* Card Footer: Action Button */}
                <div className="dsp-card-foot">
                  {req.status === 'pending' && (
                    <button
                      onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                      className="dsp-confirm-btn"
                      style={(req as any).isReturn ? { background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' } : {}}
                    >
                      <span>{(req as any).isReturn ? '↩ Arrange Pick-up' : 'Dispatch'}</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                  {req.status === 'in-transit' && (req.deliveryState === 'Not Started' || req.deliveryState === 'Out for Delivery' || req.deliveryState === 'Return In Transit') && (
                    <button
                      onClick={() => updateDeliveryState(req.id, 'Started')}
                      className="dsp-confirm-btn"
                      style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
                    >
                      <Navigation size={15} />
                      <span>Start Delivery</span>
                    </button>
                  )}
                  {req.status === 'in-transit' && req.deliveryState === 'Started' && (
                    <button
                      onClick={() => updateDeliveryState(req.id, 'Delivered')}
                      className="dsp-confirm-btn"
                      style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                    >
                      <CheckCircle size={15} />
                      <span>Confirm Delivery</span>
                    </button>
                  )}
                  {req.status === 'delivered' && (
                    <button
                      onClick={() => openUploadModal(req.id)}
                      className="dsp-confirm-btn"
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
                    >
                      <Upload size={15} />
                      <span>Upload Proof</span>
                    </button>
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
                  accept="image/*"
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
                      <span className="dsp-pod-title">Upload delivery proof image</span>
                      <span className="dsp-pod-hint">Click or drag image file here</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="dsp-modal-foot">
              <button 
                onClick={closeUploadModal}
                className="dsp-btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpload}
                disabled={!selectedFile}
                className="dsp-btn-confirm"
              >
                Done
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

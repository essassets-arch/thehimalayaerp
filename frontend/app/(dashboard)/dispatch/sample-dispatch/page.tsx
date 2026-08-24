'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PackageOpen, ArrowRight, Truck, CheckCircle, Upload, Navigation, Plus } from 'lucide-react';
import { toast } from 'sonner';
import styles from './sample-dispatch.module.css';

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
    <div className={styles.page}>
      <div className={styles.content}>
        
        {/* ── Page Header ── */}
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.watermark}>
              <PackageOpen size={160} />
            </div>

            <div className={styles.headerLayout}>
              <div className={styles.headerCopy}>
                <span className={styles.eyebrow}>Logistics Queue</span>
                <h1 className={styles.title}>Sample Dispatch Requests</h1>
                <p className={styles.description}>
                  Manage all pending requests for product samples and evaluation kits. Review approved quantities and initialize the dispatch tracking workflow.
                </p>
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryCount}>
                  <strong>{requests.filter(r => r.status === 'pending').length}</strong>
                  <span>Pending</span>
                </div>
                <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
                <div className={styles.summaryCount}>
                  <strong>{requests.filter(r => r.status === 'in-transit').length}</strong>
                  <span>In-Transit</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.headerFooter}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} in queue</span>
              <button 
                onClick={() => router.push('/dispatch/sample-dispatch/create/new')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 6, 
                  background: '#2563eb', color: 'white', border: 'none', 
                  padding: '6px 14px', borderRadius: 8, fontSize: 13, 
                  fontWeight: 600, cursor: 'pointer' 
                }}
              >
                <Plus style={{ width: 14, height: 14 }} /> Create Ad-hoc Sample
              </button>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className={styles.filters} style={{ overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <button 
            className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setUrlFilter('pending')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📋</span> Pending Dispatch
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'in-transit' ? styles.active : ''}`}
            onClick={() => setUrlFilter('in-transit')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🚚</span> In-Transit
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'delivered' ? styles.active : ''}`}
            onClick={() => setUrlFilter('delivered')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>✓</span> Delivered
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setUrlFilter('all')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🕒</span> All History
          </button>
        </div>

        {/* ── Desktop Data Table (>= 768px) ── */}
        <div className="hidden md:block">
          <div className={styles.tableContainer}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sample Order</th>
                    <th>Customer</th>
                    <th>Delivery Address</th>
                    <th>Product</th>
                    <th>Approved Qty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td className={styles.tableRowId}>
                          {req.orderNo}
                          {(req as any).isReturn && (
                            <span style={{ marginLeft: 6, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 800, letterSpacing: 0.3 }}>↩ RETURN</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{req.customer}</td>
                        <td>
                          {req.address !== 'N/A' ? (
                            <span style={{ color: '#475569' }}>{req.address}</span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: '#334155' }}>{req.product}</td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {req.approvedQty}
                          </span>
                        </td>
                        <td>
                          {req.status === 'pending' && (
                            <button 
                              className={styles.tableActionBtn}
                              style={(req as any).isReturn ? { background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' } : {}}
                              onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                            >
                              {(req as any).isReturn ? '↩ Arrange Pick-up' : 'Dispatch'} <ArrowRight style={{ width: 14, height: 14 }} />
                            </button>
                          )}
                          {req.status === 'in-transit' && (req.deliveryState === 'Not Started' || req.deliveryState === 'Out for Delivery' || req.deliveryState === 'Return In Transit') && (
                            <button 
                              className={styles.tableActionBtn}
                              style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
                              onClick={() => updateDeliveryState(req.id, 'Started')}
                            >
                              <Navigation style={{ width: 14, height: 14 }} /> {(req as any).isReturn ? 'Start Pick-up' : 'Start Delivery'}
                            </button>
                          )}
                          {req.status === 'in-transit' && req.deliveryState === 'Started' && (
                            <button 
                              className={styles.tableActionBtn}
                              style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                              onClick={() => updateDeliveryState(req.id, 'Delivered')}
                            >
                              <CheckCircle style={{ width: 14, height: 14 }} /> {(req as any).isReturn ? 'Confirm Return' : 'Confirm Delivery'}
                            </button>
                          )}
                          {req.status === 'delivered' && (
                            <button 
                              className={styles.tableActionBtn}
                              style={{ color: '#475569' }}
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
            </div>
          </div>
        </div>

        {/* ── Mobile Cards View (< 768px) ── */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(req => {
              const statusLabel = req.status === 'pending' ? 'PENDING' : req.status === 'in-transit' ? 'IN-TRANSIT' : 'DELIVERED';
              const statusBg = req.status === 'pending' ? '#FEF3C7' : req.status === 'in-transit' ? '#DBEAFE' : '#DCFCE7';
              const statusColor = req.status === 'pending' ? '#92400E' : req.status === 'in-transit' ? '#1E40AF' : '#166534';

              return (
                <div
                  key={req.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Card Header: Box Icon in purple square + ID + Timestamp + Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#F5F3FF',
                        border: '1px solid #DDD6FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#7C3AED'
                      }}>
                        <PackageOpen size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                          {req.orderNo}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • 10:30 AM
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: statusBg,
                      color: statusColor
                    }}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Customer Field */}
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                      Customer
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px', display: 'block' }}>
                      {req.customer}
                    </span>
                  </div>

                  {/* Product Field */}
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                      Product
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px', display: 'block' }}>
                      {req.product}
                    </span>
                  </div>

                  {/* Quantity Requested Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                      Quantity Requested
                    </span>
                    <span style={{
                      background: '#EFF6FF',
                      color: '#2563EB',
                      padding: '3px 12px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '13px'
                    }}>
                      {req.approvedQty}
                    </span>
                  </div>

                  {/* Special Instructions Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      Special Instructions
                    </span>
                    <span style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
                      {req.address && req.address !== 'N/A' ? req.address : 'Not provided'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div style={{ paddingTop: '6px' }}>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => router.push(`/dispatch/sample-dispatch/create/${req.id}`)}
                        style={{
                          width: '100%',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#2563EB',
                          padding: '11px',
                          borderRadius: '10px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Dispatch <ArrowRight size={16} />
                      </button>
                    )}
                    {req.status === 'in-transit' && (req.deliveryState === 'Not Started' || req.deliveryState === 'Out for Delivery' || req.deliveryState === 'Return In Transit') && (
                      <button
                        onClick={() => updateDeliveryState(req.id, 'Started')}
                        style={{
                          width: '100%',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1D4ED8',
                          padding: '11px',
                          borderRadius: '10px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Navigation size={16} /> Start Delivery
                      </button>
                    )}
                    {req.status === 'in-transit' && req.deliveryState === 'Started' && (
                      <button
                        onClick={() => updateDeliveryState(req.id, 'Delivered')}
                        style={{
                          width: '100%',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#15803D',
                          padding: '11px',
                          borderRadius: '10px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle size={16} /> Confirm Delivery
                      </button>
                    )}
                    {req.status === 'delivered' && (
                      <button
                        onClick={() => openUploadModal(req.id)}
                        style={{
                          width: '100%',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          color: '#334155',
                          padding: '11px',
                          borderRadius: '10px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Upload size={16} /> Upload Proof
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

      </div>

      {uploadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Upload Proof of Delivery</h3>
            
            <div style={{ border: '2px dashed #cbd5e1', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px', position: 'relative' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: '#64748b' }}>
                  <Upload style={{ width: 32, height: 32, marginBottom: '8px', color: '#94a3b8' }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>Click to select an image</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileSelect}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={closeUploadModal}
                style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpload}
                disabled={!selectedFile}
                style={{ padding: '8px 16px', border: 'none', background: selectedFile ? '#3b82f6' : '#94a3b8', color: '#fff', borderRadius: '6px', cursor: selectedFile ? 'pointer' : 'not-allowed', fontWeight: '600' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SampleDispatchListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SampleDispatchListContent />
    </Suspense>
  );
}

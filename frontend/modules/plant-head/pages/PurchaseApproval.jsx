'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../shared/context/ERPContext';
import { useNotificationStore } from '@/store/notificationStore';
import { purchaseOrderService } from '../../../services/procurement/purchaseOrderService';
import StatusBadge from '../../../shared/components/StatusBadge';
import DataTable from '../../../shared/components/DataTable';
import Swal from 'sweetalert2';
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  Building2, 
  Calendar, 
  User, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  X,
  FileText,
  Truck,
  Percent
} from 'lucide-react';

export default function PurchaseApproval() {
  const { state, syncData, plantHeadApprovePurchaseOrder, plantHeadRejectPurchaseOrder } = useERP();
  const showToast = useNotificationStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' | 'Approved' | 'Rejected' | 'All'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverPOs, setServerPOs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from backend endpoint
  const loadPlantHeadPOs = async () => {
    setIsLoading(true);
    try {
      const [queueRes, historyRes] = await Promise.all([
        purchaseOrderService.plantHeadQueue({ limit: 100 }).catch(() => ({ data: [] })),
        purchaseOrderService.plantHeadHistory({ limit: 100 }).catch(() => ({ data: [] }))
      ]);
      const queueList = Array.isArray(queueRes) ? queueRes : (queueRes?.data || []);
      const historyList = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);
      
      const combined = [...queueList, ...historyList];
      const uniqueMap = new Map();
      combined.forEach(p => {
        if (p?.id) uniqueMap.set(p.id, p);
      });
      setServerPOs(Array.from(uniqueMap.values()));
    } catch (err) {
      console.warn('[PurchaseApproval] Failed to load server POs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlantHeadPOs();
  }, []);

  // Merge server & local store POs
  const allPlantHeadPOs = useMemo(() => {
    const storePOs = state?.procurement?.purchaseOrders || state?.purchaseOrders || [];
    const map = new Map();
    
    // Server POs first
    serverPOs.forEach(p => {
      if (p?.id) map.set(p.id, p);
    });

    // Store POs (filter for Plant Head relevant statuses or range ₹10,000.01 - ₹15,000)
    storePOs.forEach(p => {
      const total = Number(p.totalAmount || p.grandTotal || p.value || 0);
      const isPlantHeadStatus = [
        'PENDING_PLANT_HEAD_PURCHASE_APPROVAL',
        'PLANT_HEAD_PURCHASE_APPROVED',
        'PLANT_HEAD_PURCHASE_REJECTED'
      ].includes(p.status);
      const isPlantHeadRange = total > 10000 && total <= 15000;

      if (isPlantHeadStatus || isPlantHeadRange) {
        if (!map.has(p.id)) {
          map.set(p.id, p);
        } else {
          // Merge properties if store has newer status
          const existing = map.get(p.id);
          map.set(p.id, { ...existing, ...p });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  }, [serverPOs, state?.purchaseOrders, state?.procurement?.purchaseOrders]);

  // Tab Filtering
  const filteredPOs = useMemo(() => {
    return allPlantHeadPOs.filter(po => {
      const total = Number(po.totalAmount || po.grandTotal || po.value || 0);
      const matchesSearch = 
        (po.poNumber || po.publicId || po.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (po.vendorName || po.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (po.purchaseIndentId || po.indentId || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'Pending') {
        return po.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL' || 
          (total > 10000 && total <= 15000 && ['DRAFT', 'SUBMITTED', 'PENDING'].includes(po.status));
      }
      if (activeTab === 'Approved') {
        return po.status === 'PLANT_HEAD_PURCHASE_APPROVED' || 
          (total > 10000 && total <= 15000 && ['SUPER_ADMIN_APPROVED', 'ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'PARTIALLY_RECEIVED', 'CLOSED', 'PO_CLOSED'].includes(po.status));
      }
      if (activeTab === 'Rejected') {
        return po.status === 'PLANT_HEAD_PURCHASE_REJECTED';
      }
      return true;
    });
  }, [allPlantHeadPOs, activeTab, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    allPlantHeadPOs.forEach(po => {
      const total = Number(po.totalAmount || po.grandTotal || po.value || 0);
      if (po.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL' || (total > 10000 && total <= 15000 && ['DRAFT', 'SUBMITTED', 'PENDING'].includes(po.status))) {
        pending++;
      } else if (po.status === 'PLANT_HEAD_PURCHASE_APPROVED' || (total > 10000 && total <= 15000 && ['SUPER_ADMIN_APPROVED', 'ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'PARTIALLY_RECEIVED', 'CLOSED', 'PO_CLOSED'].includes(po.status))) {
        approved++;
      } else if (po.status === 'PLANT_HEAD_PURCHASE_REJECTED') {
        rejected++;
      }
    });

    return { pending, approved, rejected, all: allPlantHeadPOs.length };
  }, [allPlantHeadPOs]);

  // Handle Approve
  const handleApprove = async (po) => {
    const { value: remarks } = await Swal.fire({
      title: 'Approve Purchase Order',
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569; margin-bottom: 12px;">
          <div><strong>PO Ref:</strong> ${po.poNumber || po.publicId || po.id}</div>
          <div><strong>Amount:</strong> ₹${Number(po.totalAmount || po.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div><strong>Vendor:</strong> ${po.vendorName || po.supplier?.name || 'N/A'}</div>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Plant Head Approval Remarks (Optional)',
      inputPlaceholder: 'Enter approval notes or technical validation remarks...',
      showCancelButton: true,
      confirmButtonText: 'Approve & Release to Finance',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#94A3B8'
    });

    if (remarks !== undefined) {
      try {
        setIsSubmitting(true);
        await plantHeadApprovePurchaseOrder(po.id, remarks || 'Approved by Plant Head', 'Plant Head');
        await syncData();
        await loadPlantHeadPOs();
        showToast(`PO ${po.poNumber || po.publicId || po.id} approved successfully!`);
        setIsDetailModalOpen(false);
      } catch (err) {
        Swal.fire('Error', err?.message || 'Failed to approve PO', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle Reject
  const handleReject = async (po) => {
    const { value: remarks } = await Swal.fire({
      title: 'Reject Purchase Order',
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569; margin-bottom: 12px;">
          <div><strong>PO Ref:</strong> ${po.poNumber || po.publicId || po.id}</div>
          <div><strong>Amount:</strong> ₹${Number(po.totalAmount || po.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Rejection Reason (Required)',
      inputPlaceholder: 'Please state the reason for rejecting this PO...',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Rejection remarks are required!';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Reject PO',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8'
    });

    if (remarks) {
      try {
        setIsSubmitting(true);
        await plantHeadRejectPurchaseOrder(po.id, remarks.trim(), 'Plant Head');
        await syncData();
        await loadPlantHeadPOs();
        showToast(`PO ${po.poNumber || po.publicId || po.id} rejected.`);
        setIsDetailModalOpen(false);
      } catch (err) {
        Swal.fire('Error', err?.message || 'Failed to reject PO', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Open Detail Modal
  const handleOpenDetail = (po) => {
    setSelectedPO(po);
    setIsDetailModalOpen(true);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#1E293B',
      boxSizing: 'border-box'
    }}>
      {/* Top Banner / Breadcrumb */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
            <span>Plant Head</span> &gt; <span style={{ color: '#2F4375', fontWeight: 800 }}>Purchase Approval</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck style={{ width: 26, height: 26, color: '#2F4375', flexShrink: 0 }} />
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Plant Head Purchase Approvals
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Review and approve purchase orders within your authorization bracket (<strong>₹10,001 – ₹15,000</strong>).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '6px 14px',
            background: '#EEF2FF',
            color: '#4338CA',
            fontSize: '12px',
            fontWeight: 800,
            borderRadius: '20px',
            border: '1px solid #C7D2FE',
            whiteSpace: 'nowrap'
          }}>
            Threshold: ₹10,001 – ₹15,000
          </span>
          <button
            onClick={loadPlantHeadPOs}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Approval</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>{counts.pending}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Awaiting your decision</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Approved POs</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669', marginTop: '2px' }}>{counts.approved}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Released to Finance</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={24} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rejected POs</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>{counts.rejected}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Returned for revision</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} color="#4F46E5" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Approval Limit</div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#4F46E5', marginTop: '4px' }}>₹10,001 – ₹15,000</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Plant Head Authority</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Subtabs and Search Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'Pending', label: 'Pending Approvals', count: counts.pending, color: '#D97706', bg: '#FEF3C7' },
              { id: 'Approved', label: 'Approved History', count: counts.approved, color: '#059669', bg: '#D1FAE5' },
              { id: 'Rejected', label: 'Rejected History', count: counts.rejected, color: '#DC2626', bg: '#FEE2E2' },
              { id: 'All', label: 'All Bracket POs', count: counts.all, color: '#475569', bg: '#F1F5F9' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? '#2F4375' : '#F8FAFC',
                  color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : tab.bg,
                    color: activeTab === tab.id ? '#FFFFFF' : tab.color
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search PO, Vendor, Indent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                background: '#F8FAFC'
              }}
            />
          </div>
        </div>

        {/* PO Table */}
        <div style={{ padding: '0' }}>
          <DataTable
            columns={[
              {
                header: 'PO Ref',
                accessor: 'id',
                render: row => (
                  <div>
                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{row.poNumber || row.publicId || row.id}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Indent: {row.purchaseIndentId || row.indentId || 'Direct'}
                    </div>
                  </div>
                )
              },
              {
                header: 'Vendor / Supplier',
                accessor: 'vendorName',
                render: row => (
                  <div>
                    <div style={{ fontWeight: 700, color: '#2F4375' }}>{row.vendorName || row.supplier?.name || 'Selected Vendor'}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{row.supplier?.contact || row.supplier?.email || '—'}</div>
                  </div>
                )
              },
              {
                header: 'Items Count',
                accessor: 'items',
                render: row => {
                  const count = Array.isArray(row.items) ? row.items.length : 1;
                  return (
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  );
                }
              },
              {
                header: 'Total Commercial Amount',
                accessor: 'totalAmount',
                render: row => {
                  const val = Number(row.totalAmount || row.grandTotal || 0);
                  return (
                    <div>
                      <div style={{ fontWeight: 900, color: '#059669', fontSize: '14px' }}>
                        ₹{val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>Plant Head Bracket</div>
                    </div>
                  );
                }
              },
              {
                header: 'Status',
                accessor: 'status',
                render: row => <StatusBadge status={row.status} />
              },
              {
                header: 'Created Date',
                accessor: 'createdAt',
                render: row => (
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                )
              }
            ]}
            data={filteredPOs}
            actions={row => (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleOpenDetail(row)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={14} /> View Details
                </button>

                {row.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApprove(row)}
                      disabled={isSubmitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        background: '#10B981',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>

                    <button
                      onClick={() => handleReject(row)}
                      disabled={isSubmitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        background: '#EF4444',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
              </div>
            )}
            emptyMessage={activeTab === 'Pending' ? 'No purchase orders pending Plant Head approval.' : 'No purchase orders found for this filter.'}
          />
        </div>
      </div>

      {/* PO Detail & Breakdown Modal */}
      {isDetailModalOpen && selectedPO && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #CBD5E1' }}>
            {/* Modal Header */}
            <div style={{ background: '#24345C', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Plant Head Approval Review</div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0' }}>
                  {selectedPO.poNumber || selectedPO.publicId || selectedPO.id}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#FFFFFF', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Vendor</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                    {selectedPO.vendorName || selectedPO.supplier?.name || 'Selected Vendor'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>GSTIN: {selectedPO.supplier?.gstin || selectedPO.gstin || '27AADCS1234F1Z8'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Indent Reference</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#2F4375', marginTop: '2px' }}>
                    {selectedPO.purchaseIndentId || selectedPO.indentId || 'N/A'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Department: {selectedPO.purchaseIndent?.department || selectedPO.department || 'Plant Store'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Required By Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                    {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString('en-IN') : 'Standard'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Terms: {selectedPO.paymentTerms || '30 Days Net'}</div>
                </div>
              </div>

              {/* Items Table */}
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#2F4375" /> Order Line Items & Quantities
              </h3>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 800 }}>Material / Product</th>
                      <th style={{ padding: '10px 14px', fontWeight: 800 }}>Qty</th>
                      <th style={{ padding: '10px 14px', fontWeight: 800 }}>Unit Price</th>
                      <th style={{ padding: '10px 14px', fontWeight: 800 }}>GST %</th>
                      <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right' }}>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPO.items || []).map((item, idx) => {
                      const qty = Number(item.quantity || item.orderedQty || 0);
                      const rate = Number(item.unitPrice || item.rate || 0);
                      const gstPct = Number(item.gstPercent || 18);
                      const base = qty * rate;
                      const tax = base * (gstPct / 100);
                      const lineTotal = Number(item.lineTotal || (base + tax));

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#1E293B' }}>
                              {item.materialName || item.product?.name || item.name || 'Raw Material'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.materialCode || item.product?.sku || 'SKU'}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B' }}>
                            {qty} {item.unit || item.product?.unit || 'Units'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            ₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {gstPct}%
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Commercial Summary Calculation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Finance / Requester Remarks</div>
                  <div style={{ fontSize: '13px', color: '#334155', fontStyle: selectedPO.snapshot?.remarks || selectedPO.orderRemarks ? 'normal' : 'italic' }}>
                    {selectedPO.snapshot?.remarks || selectedPO.orderRemarks || 'Standard raw material procurement for manufacturing operations.'}
                  </div>
                  {selectedPO.rejectionReason && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#FEE2E2', borderLeft: '4px solid #DC2626', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Rejection Reason:</div>
                      <div style={{ fontSize: '12px', color: '#991B1B', marginTop: '2px' }}>{selectedPO.rejectionReason}</div>
                    </div>
                  )}
                </div>

                <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                    <span>Freight / Transport:</span>
                    <span>₹{Number(selectedPO.freight || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                    <span>GST Tax Amount:</span>
                    <span>₹{Number(selectedPO.gstAmount || selectedPO.snapshot?.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ borderTop: '2px solid #16A34A', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: '#166534' }}>Final PO Total:</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803D' }}>
                      ₹{Number(selectedPO.totalAmount || selectedPO.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{ padding: '9px 18px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>

              {selectedPO.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleReject(selectedPO)}
                    disabled={isSubmitting}
                    style={{ padding: '9px 18px', background: '#EF4444', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <XCircle size={16} /> Reject PO
                  </button>

                  <button
                    onClick={() => handleApprove(selectedPO)}
                    disabled={isSubmitting}
                    style={{ padding: '9px 24px', background: '#10B981', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
                  >
                    <CheckCircle2 size={16} /> Approve & Release to Finance
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

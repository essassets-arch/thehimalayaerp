'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  User, 
  Truck, 
  Layers, 
  ChevronRight,
  Filter,
  Check,
  Copy
} from 'lucide-react';
import { grnService } from '../../../services/procurement/grnService';
import Swal from 'sweetalert2';

const formatDate = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const formatDateShort = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDeliveries = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await grnService.deliveryHistory({ limit: 200 });
      const rawList = Array.isArray(response) 
        ? response 
        : (response?.data || response?.items || []);
      
      const normalized = rawList.map((item) => {
        const snapshot = item.snapshot || {};
        const items = item.items || [];
        const po = item.purchaseOrder || {};
        const supplier = po.supplier || {};

        const totalAccepted = items.reduce(
          (sum, it) => sum + Number(it.acceptedQuantity || 0), 
          0
        );
        const totalRejected = items.reduce(
          (sum, it) => sum + Number(it.rejectedQuantity || 0), 
          0
        );
        const totalReceived = items.reduce(
          (sum, it) => sum + Number(it.receivedQuantity || (Number(it.acceptedQuantity || 0) + Number(it.rejectedQuantity || 0))), 
          0
        );

        return {
          id: item.id,
          grnNumber: item.grnNumber || item.publicId || `GRN-${item.id.slice(0, 8).toUpperCase()}`,
          poNumber: po.poNumber || po.publicId || item.purchaseOrderId || 'PO-RECORD',
          poId: po.id || item.purchaseOrderId,
          vendorName: supplier.name || snapshot.vendorName || 'Vendor / Supplier',
          vendorCode: supplier.vendorCode || supplier.publicId || '—',
          receivedAt: item.receivedAt || item.createdAt,
          status: item.status || 'VERIFIED',
          receivedBy: item.receivedBy?.name || item.receivedBy?.email || snapshot.receivedBy || 'Store Operator',
          warehouseName: item.warehouse?.name || 'Raw Material Warehouse',
          challanNumber: item.challanNumber || snapshot.deliveryChallanNumber || snapshot.challanNo || '—',
          invoiceNumber: item.invoiceNumber || snapshot.invoiceNumber || snapshot.invoiceNo || '—',
          remarks: item.remarks || snapshot.remarks || '',
          totalAccepted,
          totalRejected,
          totalReceived,
          items: items.map((it) => ({
            id: it.id,
            name: it.product?.name || it.productName || 'Raw Material',
            code: it.product?.sku || it.product?.publicId || '—',
            unit: it.product?.unit || 'Units',
            receivedQuantity: Number(it.receivedQuantity || (Number(it.acceptedQuantity || 0) + Number(it.rejectedQuantity || 0))),
            acceptedQuantity: Number(it.acceptedQuantity || 0),
            rejectedQuantity: Number(it.rejectedQuantity || 0),
            inspectionRemarks: it.inspectionRemarks || '',
          })),
        };
      });

      setDeliveries(normalized);
    } catch (err) {
      console.error('Failed to load delivery history:', err);
      // Fallback: load via standard GRN list if store/deliveries has any route restriction
      try {
        const fallbackRes = await grnService.list({ limit: 100 });
        const rawFallback = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes?.data || []);
        const fallbackNormalized = rawFallback.map((item) => {
          const snapshot = item.snapshot || {};
          const items = item.items || [];
          const po = item.purchaseOrder || {};
          const supplier = po.supplier || {};

          return {
            id: item.id,
            grnNumber: item.grnNumber || item.publicId || `GRN-${item.id.slice(0, 8).toUpperCase()}`,
            poNumber: po.poNumber || po.publicId || item.purchaseOrderId || 'PO-RECORD',
            poId: po.id || item.purchaseOrderId,
            vendorName: supplier.name || snapshot.vendorName || 'Vendor / Supplier',
            vendorCode: supplier.vendorCode || supplier.publicId || '—',
            receivedAt: item.receivedAt || item.createdAt,
            status: item.status || 'VERIFIED',
            receivedBy: snapshot.receivedBy || 'Store Operator',
            warehouseName: item.warehouse?.name || 'Raw Material Warehouse',
            challanNumber: snapshot.deliveryChallanNumber || snapshot.challanNo || '—',
            invoiceNumber: snapshot.invoiceNumber || snapshot.invoiceNo || '—',
            remarks: snapshot.remarks || '',
            totalAccepted: items.reduce((sum, it) => sum + Number(it.acceptedQuantity || 0), 0),
            totalRejected: items.reduce((sum, it) => sum + Number(it.rejectedQuantity || 0), 0),
            totalReceived: items.reduce((sum, it) => sum + Number(it.receivedQuantity || it.acceptedQuantity || 0), 0),
            items: items.map((it) => ({
              id: it.id,
              name: it.product?.name || 'Raw Material',
              code: it.product?.sku || '—',
              unit: it.product?.unit || 'Units',
              receivedQuantity: Number(it.receivedQuantity || it.acceptedQuantity || 0),
              acceptedQuantity: Number(it.acceptedQuantity || 0),
              rejectedQuantity: Number(it.rejectedQuantity || 0),
              inspectionRemarks: it.inspectionRemarks || '',
            })),
          };
        });
        setDeliveries(fallbackNormalized);
      } catch (fallbackErr) {
        console.error('Fallback GRN fetch also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();

    const handleInventoryUpdated = () => {
      fetchDeliveries(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('inventory-updated', handleInventoryUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('inventory-updated', handleInventoryUpdated);
      }
    };
  }, [fetchDeliveries]);

  // Copy helper
  const copyToClipboard = (text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // KPI calculations
  const stats = useMemo(() => {
    const totalDeliveries = deliveries.length;
    const totalAccepted = deliveries.reduce((s, d) => s + d.totalAccepted, 0);
    const totalRejected = deliveries.reduce((s, d) => s + d.totalRejected, 0);
    const verifiedCount = deliveries.filter(d => ['VERIFIED', 'COMPLETED', 'RECEIVED'].includes((d.status || '').toUpperCase())).length;
    return { totalDeliveries, totalAccepted, totalRejected, verifiedCount };
  }, [deliveries]);

  // Filtering
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesGRN = (item.grnNumber || '').toLowerCase().includes(q);
        const matchesPO = (item.poNumber || '').toLowerCase().includes(q);
        const matchesVendor = (item.vendorName || '').toLowerCase().includes(q);
        const matchesChallan = (item.challanNumber || '').toLowerCase().includes(q);
        const matchesInvoice = (item.invoiceNumber || '').toLowerCase().includes(q);
        const matchesItem = (item.items || []).some(
          it => (it.name || '').toLowerCase().includes(q) || (it.code || '').toLowerCase().includes(q)
        );
        if (!matchesGRN && !matchesPO && !matchesVendor && !matchesChallan && !matchesInvoice && !matchesItem) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'VERIFIED' && !['VERIFIED', 'RECEIVED'].includes(item.status)) return false;
        if (statusFilter === 'COMPLETED' && item.status !== 'COMPLETED') return false;
        if (statusFilter === 'AUDITED' && item.status !== 'AUDITED') return false;
        if (statusFilter === 'REJECTIONS' && item.totalRejected <= 0) return false;
      }

      // Date filter
      if (dateFilter !== 'ALL') {
        const itemDate = new Date(item.receivedAt);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'MONTH') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [deliveries, searchQuery, statusFilter, dateFilter]);

  // Print Delivery Slip
  const handlePrintDelivery = (delivery) => {
    if (!delivery) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('Popup Blocked', 'Please allow popups to print delivery receipts.', 'warning');
      return;
    }

    const itemsHtml = (delivery.items || []).map((it, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700;">${it.name} <br/><span style="font-size: 11px; color: #64748b; font-weight: normal;">Code: ${it.code}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${it.receivedQuantity} ${it.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #16a34a; font-weight: bold;">${it.acceptedQuantity} ${it.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: ${it.rejectedQuantity > 0 ? '#dc2626' : '#64748b'}; font-weight: bold;">${it.rejectedQuantity} ${it.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${it.inspectionRemarks || 'Inspection passed'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Goods_Receipt_${delivery.grnNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #1e293b; background: #fff; margin: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
          .card { background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .card-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .card-value { font-size: 14px; font-weight: 800; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
          th { background: #f1f5f9; padding: 10px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          .sig-box { width: 200px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">THE HIMALAYA ENTERPRISES</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Store Material Receipt & Inward Verification Slip</p>
          </div>
          <div style="text-align: right;">
            <div class="badge">VERIFIED INWARD RECEIPT</div>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${delivery.grnNumber}</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-label">Purchase Order Reference</div>
            <div class="card-value">${delivery.poNumber}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Vendor: ${delivery.vendorName}</div>
          </div>
          <div class="card">
            <div class="card-label">Delivery Date & Timestamp</div>
            <div class="card-value">${formatDate(delivery.receivedAt)}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Warehouse: ${delivery.warehouseName}</div>
          </div>
          <div class="card">
            <div class="card-label">Delivery Challan / Invoice #</div>
            <div class="card-value">Challan: ${delivery.challanNumber || 'N/A'} | Inv: ${delivery.invoiceNumber || 'N/A'}</div>
          </div>
          <div class="card">
            <div class="card-label">Received & Inspected By</div>
            <div class="card-value">${delivery.receivedBy}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          Delivered Goods & Quality Manifest
        </h3>
        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 40px;">#</th>
              <th style="text-align: left;">Material / Product</th>
              <th style="text-align: center;">Total Received</th>
              <th style="text-align: center;">Accepted (Stocked)</th>
              <th style="text-align: center;">Rejected</th>
              <th style="text-align: left;">Inspection Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        ${delivery.remarks ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Store Remarks</div>
            <div style="font-size: 13px; color: #334155; margin-top: 4px;">${delivery.remarks}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div class="sig-box">Store Receiver Signature</div>
          <div class="sig-box">Quality Inspector Signature</div>
          <div class="sig-box">Authorized Gate Pass</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── Top Metric KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            color: '#2563eb',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
          }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Inward Receipts
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.totalDeliveries}
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            color: '#059669',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Accepted & Stocked
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.totalAccepted.toLocaleString('en-IN')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Units</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rejected / Damaged
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: stats.totalRejected > 0 ? '#dc2626' : '#64748b', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.totalRejected.toLocaleString('en-IN')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Units</span>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
            color: '#7e22ce',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Inward Rate
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#7e22ce', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.totalDeliveries > 0 ? Math.round((stats.verifiedCount / stats.totalDeliveries) * 100) : 100}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Control Bar: Search & Status Filters ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search GRN, PO, Vendor, Material, Challan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1.5px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              background: '#f8fafc',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {[
              { id: 'ALL', label: 'All Receipts' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'REJECTIONS', label: 'Has Rejections' },
            ].map(f => {
              const active = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#0f172a' : '#64748b',
                    fontSize: '12px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1.5px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              background: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>

          <button
            type="button"
            onClick={() => fetchDeliveries(true)}
            disabled={isRefreshing}
            style={{
              padding: '7px 12px',
              border: '1.5px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#475569',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Delivery Receipts Data Table ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}>
        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
              Loading live delivery history...
            </p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              {searchQuery ? 'No matching deliveries found' : 'No inward deliveries recorded yet'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {searchQuery ? 'Try adjusting your search keywords or filters.' : 'Deliveries verified at the store gate will automatically appear here with their GRN breakdown.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    GRN / Receipt #
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PO Reference
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vendor / Supplier
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Delivered Materials
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Challan / Invoice
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Received At
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery, index) => {
                  const isCopied = copiedId === delivery.id;
                  return (
                    <tr 
                      key={delivery.id || index}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* GRN No */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace' }}>
                            {delivery.grnNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(delivery.grnNumber, delivery.id)}
                            title="Copy GRN Number"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: isCopied ? '#16a34a' : '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                            }}
                          >
                            {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          By: {delivery.receivedBy}
                        </div>
                      </td>

                      {/* PO Ref */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {delivery.poNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {delivery.warehouseName}
                        </div>
                      </td>

                      {/* Vendor */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                          {delivery.vendorName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Code: {delivery.vendorCode}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {(delivery.items || []).slice(0, 2).map((it, i) => (
                            <div key={i} style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>• {it.name}</span>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                                +{it.acceptedQuantity} {it.unit}
                              </span>
                              {it.rejectedQuantity > 0 && (
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px' }}>
                                  -{it.rejectedQuantity} rej
                                </span>
                              )}
                            </div>
                          ))}
                          {(delivery.items || []).length > 2 && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              +{delivery.items.length - 2} more item(s)...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Challan / Invoice */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                          Challan: <span style={{ color: '#0f172a', fontWeight: 800 }}>{delivery.challanNumber}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          Inv: {delivery.invoiceNumber}
                        </div>
                      </td>

                      {/* Received At */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                          {formatDateShort(delivery.receivedAt)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {formatDate(delivery.receivedAt).split(',')[1] || ''}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 9px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                        }}>
                          <CheckCircle2 size={12} />
                          {delivery.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDelivery(delivery)}
                            title="View Material Manifest Breakdown"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintDelivery(delivery)}
                            title="Print Goods Receipt Slip"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#475569',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detailed Receipt Manifest Modal / Drawer ── */}
      {selectedDelivery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a7b 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Goods Receipt Note (GRN) Manifest
                </div>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '19px', fontWeight: 900, color: '#fff' }}>
                  {selectedDelivery.grnNumber}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                  PO: {selectedDelivery.poNumber} • Vendor: {selectedDelivery.vendorName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDelivery(null)}
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Delivery Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivery Challan #</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{selectedDelivery.challanNumber || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Vendor Invoice #</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{selectedDelivery.invoiceNumber || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Received Timestamp</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatDate(selectedDelivery.receivedAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Store Operator</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{selectedDelivery.receivedBy}</div>
                </div>
              </div>

              {/* Itemized Breakdown Table */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Delivered Materials & Stock Allocation ({selectedDelivery.items?.length || 0} Items)
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Material</th>
                        <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Total Received</th>
                        <th style={{ padding: '10px 14px', fontWeight: 800, color: '#16a34a', textAlign: 'center' }}>Accepted (Stocked)</th>
                        <th style={{ padding: '10px 14px', fontWeight: 800, color: '#dc2626', textAlign: 'center' }}>Rejected</th>
                        <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Inspection Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedDelivery.items || []).map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{it.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {it.code}</div>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                            {it.receivedQuantity} {it.unit}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>
                            +{it.acceptedQuantity} {it.unit}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: it.rejectedQuantity > 0 ? '#dc2626' : '#94a3b8' }}>
                            {it.rejectedQuantity > 0 ? `-${it.rejectedQuantity} ${it.unit}` : '0'}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569' }}>
                            {it.inspectionRemarks || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Store Remarks */}
              {selectedDelivery.remarks && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Store Gate Remarks</div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>{selectedDelivery.remarks}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '14px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <button
                type="button"
                onClick={() => handlePrintDelivery(selectedDelivery)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={15} />
                <span>Print Delivery Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDelivery(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
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

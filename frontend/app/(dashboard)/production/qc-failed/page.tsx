'use client';

import React, { useEffect, useState } from 'react';
import {
  Play,
  Search,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Building2,
  Boxes,
  Clock,
  RotateCcw,
  History,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import styles from './qc-failed.module.css';
import { backendFetch } from '@/lib/backendFetch';
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';

export default function QCFailedPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [historyJobs, setHistoryJobs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentJobIds, setSentJobIds] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [failedRes, historyRes] = await Promise.allSettled([
        backendFetch('/api/backend/production/qc-failed'),
        backendFetch('/api/backend/production/qc-failed-history'),
      ]);

      let failedList: any[] = [];
      if (failedRes.status === 'fulfilled') {
        const res: any = failedRes.value;
        failedList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];
      }

      let historyList: any[] = [];
      if (historyRes.status === 'fulfilled') {
        const res: any = historyRes.value;
        historyList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];
      }

      // If history endpoint returned empty or failed, fallback to failedList
      if (historyList.length === 0 && failedList.length > 0) {
        historyList = failedList;
      }

      setActiveJobs(failedList);
      setHistoryJobs(historyList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load QC failed list');
      setActiveJobs([]);
      setHistoryJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
  }, []);

  const isSentToFloor = (job: any) => {
    if (sentJobIds.has(job.id)) return true;
    const status = String(job.productionStatus || job.status || job.workflowState?.name || '').toUpperCase();
    return status === 'REWORK_IN_PROGRESS' || status === 'IN_PRODUCTION' || status === 'STARTED';
  };

  const handleStartRework = async (job: any) => {
    const jobId = job.id;
    const woNumber = job.workOrderNumber || job.id;

    const confirmation = await Swal.fire({
      title: 'Start Rework Process?',
      text: `Move work order #${woNumber} back to the Production Floor for rework?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send to Rework',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn',
      },
      buttonsStyling: false,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setSendingId(jobId);
      await backendFetch(`/api/backend/production/${jobId}/start-rework`, { method: 'POST' });

      // Mark locally as sent
      setSentJobIds((prev) => new Set([...prev, jobId]));

      await Swal.fire({
        icon: 'success',
        title: 'Sent for Rework! 🔁',
        html: `Work Order <strong>#${woNumber}</strong> is now marked as <strong>REWORK</strong> and routed back to <a href="/production/work-orders" style="color: #ea580c; font-weight: bold; text-decoration: underline;">Work Orders</a> & <a href="/production/floor" style="color: #ea580c; font-weight: bold; text-decoration: underline;">Production Floor</a>.`,
        showCancelButton: true,
        confirmButtonText: 'View in Work Orders →',
        cancelButtonText: 'Stay on QC Failed',
        confirmButtonColor: '#ea580c',
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = '/production/work-orders';
        }
      });

      fetchJobs();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Rework Action Failed',
        text: err.message || 'Failed to start rework process.',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn',
        },
        buttonsStyling: false,
      });
    } finally {
      setSendingId(null);
    }
  };

  const getProductName = (job: any) => {
    return (
      job.salesOrderItem?.productNameSnapshot ||
      job.salesOrderItem?.product?.name ||
      job.productName ||
      job.product ||
      'FRP High Grade Product'
    );
  };

  const handleOpenDetails = (job: any) => {
    const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
    const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
    const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;

    const so = job.productionPlan?.salesOrder || job.salesOrder;
    const leadObj = so?.quotation?.lead || so?.sourceQuotation?.lead || job.quotation?.lead || job.sourceQuotation?.lead;
    const customerObj = so?.customer || job.customer;
    const customerName =
      customerObj?.companyName ||
      customerObj?.name ||
      leadObj?.companyName ||
      leadObj?.projectName ||
      leadObj?.customerName ||
      so?.customerName ||
      job.customerName ||
      job.companyName ||
      'Consignee Client';
    const address = customerObj?.address || customerObj?.city || job.customerAddress || 'Plant Warehouse';
    const gst = customerObj?.gstin || customerObj?.gst || job.customerGst || '27ABCDE4321G2Z8';

    const rawDate = job.createdAt || (job.productionPlan?.salesOrder as any)?.createdAt;
    const orderDate = rawDate
      ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let itemsList: Array<{ name: string; code: string; qty: number; rate?: number; gst?: number; total?: number }> = [];

    const soItems = job.productionPlan?.salesOrder?.items || job.salesOrder?.items;
    if (Array.isArray(soItems) && soItems.length > 0) {
      itemsList = soItems.map((item: any) => {
        const name = item.product?.name || item.productNameSnapshot || item.productName || item.name || 'Ordered Product';
        const code = item.product?.sku || item.product?.publicId || item.product?.code || item.productCodeSnapshot || item.productCode || '-';
        const qty = Number(item.quantity ?? job.quantity ?? 1);
        const rate = Number(item.unitPrice ?? item.price ?? 0);
        return { name, code, qty, rate };
      });
    }

    if (itemsList.length === 0 && job.salesOrderItem) {
      const soi = job.salesOrderItem;
      const name = soi.product?.name || soi.productName || 'QC Inspection Item';
      const code = soi.product?.sku || soi.product?.code || job.workOrderNumber || '-';
      const qty = Number(job.quantity || 1);
      itemsList.push({ name, code, qty });
    }

    if (itemsList.length === 0) {
      itemsList.push({
        name: job.productName || `Work Order - ${job.workOrderNumber || '001'}`,
        code: job.productCode || job.workOrderNumber || '-',
        qty: Number(job.quantity || 1)
      });
    }

    const mapped = {
      ref: soNo,
      orderNo: soNo,
      customerName,
      address,
      gst,
      orderDate,
      salesStatus: 'Confirmed',
      productionStatus: job.productionStatus || 'QC Failed',
      dispatchStatus: 'Pending',
      items: itemsList,
    };
    setSelectedOrderForModal(mapped);
  };

  const currentList = activeTab === 'ACTIVE' ? activeJobs : historyJobs;
  const filteredJobs = currentList.filter((job: any) => {
    const q = searchQuery.toLowerCase();
    const soNo = (job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber || '').toLowerCase();
    const woNo = (job.workOrderNumber || job.id || '').toLowerCase();
    const customer = (job.productionPlan?.salesOrder?.customer?.companyName || job.customerName || '').toLowerCase();
    const product = getProductName(job).toLowerCase();
    const reason = (job.failureReason || '').toLowerCase();
    return soNo.includes(q) || woNo.includes(q) || customer.includes(q) || product.includes(q) || reason.includes(q);
  });

  const renderHistoryStatus = (job: any) => {
    const prodStatus = String(job.productionStatus || job.status || '').toUpperCase();
    if (prodStatus === 'READY_FOR_DISPATCH' || job.status === 'QC_APPROVED' || job.qcResult === 'PASS') {
      return (
        <span className={styles.badgePassed}>
          <CheckCircle2 size={12} /> Passed Re-Inspection
        </span>
      );
    }
    if (prodStatus === 'REWORK_IN_PROGRESS') {
      return (
        <span className={styles.badgeInRework}>
          <RotateCcw size={12} /> In Rework on Floor
        </span>
      );
    }
    if (prodStatus === 'QC_PENDING') {
      return (
        <span className={styles.badgeQcPending}>
          <Clock size={12} /> In QC Re-Inspection
        </span>
      );
    }
    return (
      <span className={styles.badgeFailed}>
        <AlertTriangle size={12} /> Failed - Action Required
      </span>
    );
  };

  if (!isClient) return null;

  return (
    <div className={styles.page}>
      {/* ─── Hero Banner ─── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <XCircle size={24} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Quality Assurance & Diagnostics</span>
          <h1>QC Failed Jobs</h1>
          <p>Manage items that failed quality inspection, route rework to the floor, and track historical defect resolutions</p>
        </div>
        <div className={styles.summaryBadges}>
          <div className={styles.summaryBadge}>
            <span className={styles.liveDot} />
            <strong>{activeJobs.length}</strong>
            <span>Active<br />Queue</span>
          </div>
          <div className={styles.summaryBadge} style={{ border: '1px solid #cbd5e1' }}>
            <History size={20} color="#475569" />
            <strong style={{ color: '#0f172a' }}>{historyJobs.length}</strong>
            <span>Total<br />History</span>
          </div>
        </div>
      </div>

      {/* ─── Panel Card ─── */}
      <div className={styles.panel}>
        {/* ─── Tabs & Search Toolbar ─── */}
        <div className={styles.toolbar}>
          {/* Tab Group */}
          <div className={styles.tabGroup}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'ACTIVE' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('ACTIVE')}
            >
              <AlertCircle size={14} />
              <span>Active Queue</span>
              <span className={activeTab === 'ACTIVE' ? styles.tabBadge : styles.tabBadgeNeutral}>
                {activeJobs.length}
              </span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'HISTORY' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('HISTORY')}
            >
              <History size={14} />
              <span>Failure History</span>
              <span className={activeTab === 'HISTORY' ? styles.tabBadge : styles.tabBadgeNeutral}>
                {historyJobs.length}
              </span>
            </button>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.search}>
              <Search size={16} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search sales order, WO, product, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={fetchJobs} className={styles.refreshBtn}>
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ─── Table / Cards Content ─── */}
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading QC failed records...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 12px', display: 'block' }} />
            <h3>
              {activeTab === 'ACTIVE' ? 'No Active Failed Jobs' : 'No Failure History Found'}
            </h3>
            <p>
              {searchQuery
                ? `No records matched "${searchQuery}".`
                : activeTab === 'ACTIVE'
                ? 'All production items have passed quality control inspection or none are currently queued for rework.'
                : 'No historical QC failure records recorded.'}
            </p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards Layout */}
            <div className={styles.mobileCardsContainer}>
              {filteredJobs.map((job: any) => {
                const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
                const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
                const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
                const so = job.productionPlan?.salesOrder || job.salesOrder;
                const leadObj = so?.quotation?.lead || so?.sourceQuotation?.lead || job.quotation?.lead || job.sourceQuotation?.lead;
                const customerObj = so?.customer || job.customer;
                const customerName =
                  customerObj?.companyName ||
                  customerObj?.name ||
                  leadObj?.companyName ||
                  leadObj?.projectName ||
                  leadObj?.customerName ||
                  so?.customerName ||
                  job.customerName ||
                  job.companyName ||
                  'Consignee Client';
                const prodName = getProductName(job);
                const isSent = isSentToFloor(job);

                return (
                  <div key={job.id} className={styles.mobileCard}>
                    {/* Header: SO, WO, and Status / Defect */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            onClick={() => handleOpenDetails(job)}
                            className={styles.soLinkMobile}
                          >
                            {soNo}
                          </span>
                          <span className={styles.woBadgeMobile}>
                            {job.workOrderNumber || 'WO'}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerName}</span>
                        </div>
                      </div>

                      {activeTab === 'ACTIVE' ? (
                        <span className={styles.defectBadgeMobile}>
                          <AlertTriangle size={12} />
                          {job.failureReason || 'QC Defect'}
                        </span>
                      ) : (
                        renderHistoryStatus(job)
                      )}
                    </div>

                    {/* Product & Qty Row */}
                    <div className={styles.mobileProductBox}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.mobileProductItemName}>{prodName}</div>
                        {(job.productCode || job.salesOrderItem?.product?.sku) && (
                          <div className={styles.mobileProductItemSku}>
                            SKU: {job.productCode || job.salesOrderItem?.product?.sku}
                          </div>
                        )}
                      </div>

                      <div className={styles.qtyBadgeMobile}>
                        {job.quantity || 1} <span style={{ fontSize: '10px', fontWeight: '700', color: '#0369a1' }}>UNITS</span>
                      </div>
                    </div>

                    {/* Defect Tag for History tab */}
                    {activeTab === 'HISTORY' && job.failureReason && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                          ⚠️ Defect: {job.failureReason}
                        </span>
                      </div>
                    )}

                    {/* QC Remarks / Failure Notes */}
                    {job.qcRemarks && (
                      <div className={styles.mobileRemarksBox}>
                        <strong>QC Note:</strong> {job.qcRemarks}
                      </div>
                    )}

                    {/* Date and Rework Counter */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#94a3b8" />
                        <span>{job.qcTimestamp ? new Date(job.qcTimestamp).toLocaleDateString('en-GB') : 'Failed Recently'}</span>
                      </div>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                        Rework Count: #{job.reworkCount || 0}
                      </span>
                    </div>

                    {/* Action Footer */}
                    <div className={styles.mobileActionFooter}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(job)}
                        className={styles.btnTerminalMobile}
                      >
                        <Eye size={13} /> View Details
                      </button>

                      {activeTab === 'ACTIVE' && (
                        sendingId === job.id ? (
                          <button type="button" disabled className={styles.btnSending} style={{ height: '34px' }}>
                            <RotateCcw size={12} className="animate-spin" /> Sending…
                          </button>
                        ) : isSent ? (
                          <button
                            type="button"
                            onClick={() => window.location.href = '/production/work-orders'}
                            className={styles.btnSentMobile}
                            title="Already sent to floor for rework. Click to view in Work Orders."
                          >
                            <CheckCircle2 size={13} /> Already Sent to Work →
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartRework(job)}
                            className={styles.btnStartMobile}
                          >
                            <Play size={13} fill="#ffffff" /> Send to Floor
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table Layout */}
            <div className={styles.desktopTableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth: '180px' }}>Sales Order & WO #</th>
                    <th style={{ minWidth: '160px' }}>Customer</th>
                    <th style={{ minWidth: '220px' }}>Product Item</th>
                    <th style={{ minWidth: '90px', textAlign: 'center' }}>Qty</th>
                    <th style={{ minWidth: '180px' }}>Failure Reason</th>
                    {activeTab === 'HISTORY' ? (
                      <th style={{ minWidth: '170px', textAlign: 'center' }}>Current Resolution</th>
                    ) : (
                      <th style={{ minWidth: '180px' }}>QC Remarks</th>
                    )}
                    <th style={{ minWidth: '90px', textAlign: 'center' }}>Reworks</th>
                    <th style={{ minWidth: '140px' }}>Failed Date</th>
                    <th style={{ minWidth: '180px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job: any) => {
                    const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
                    const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
                    const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
                    const so = job.productionPlan?.salesOrder || job.salesOrder;
                    const leadObj = so?.quotation?.lead || so?.sourceQuotation?.lead || job.quotation?.lead || job.sourceQuotation?.lead;
                    const customerObj = so?.customer || job.customer;
                    const customerName =
                      customerObj?.companyName ||
                      customerObj?.name ||
                      leadObj?.companyName ||
                      leadObj?.projectName ||
                      leadObj?.customerName ||
                      so?.customerName ||
                      job.customerName ||
                      job.companyName ||
                      'Consignee Client';
                    const prodName = getProductName(job);
                    const isSent = isSentToFloor(job);

                    return (
                      <tr key={job.id}>
                        {/* Sales Order & WO */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span 
                              onClick={() => handleOpenDetails(job)}
                              style={{ fontWeight: 700, color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              {soNo}
                            </span>
                            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', width: 'fit-content' }}>
                              WO: {job.workOrderNumber || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td>
                          <span style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={13} color="#94a3b8" />
                            {customerName}
                          </span>
                        </td>

                        {/* Product Item */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{prodName}</span>
                            {(job.productCode || job.salesOrderItem?.product?.sku) && (
                              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                SKU: {job.productCode || job.salesOrderItem?.product?.sku}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Qty */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                            {job.quantity || 1}
                          </span>
                        </td>

                        {/* Failure Reason */}
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                            <AlertTriangle size={13} />
                            {job.failureReason || 'QC Defect'}
                          </span>
                        </td>

                        {/* Column: Current Resolution for History vs QC Remarks for Active */}
                        {activeTab === 'HISTORY' ? (
                          <td style={{ textAlign: 'center' }}>
                            {renderHistoryStatus(job)}
                          </td>
                        ) : (
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.qcRemarks || '-'}>
                            <span style={{ color: '#475569', fontSize: '12.5px' }}>
                              {job.qcRemarks || '-'}
                            </span>
                          </td>
                        )}

                        {/* Reworks */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px', color: '#334155' }}>
                            #{job.reworkCount || 0}
                          </span>
                        </td>

                        {/* Failed Date */}
                        <td style={{ fontSize: '12.5px', color: '#64748b' }}>
                          {job.qcTimestamp ? new Date(job.qcTimestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <button 
                              type="button" 
                              onClick={() => handleOpenDetails(job)}
                              style={{ padding: '6px 10px', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={13} /> View
                            </button>

                            {activeTab === 'ACTIVE' && (
                              sendingId === job.id ? (
                                <button disabled className={styles.btnSending}>
                                  <RotateCcw size={12} className="animate-spin" /> Sending…
                                </button>
                              ) : isSent ? (
                                <button
                                  type="button"
                                  onClick={() => window.location.href = '/production/work-orders'}
                                  className={styles.btnSentToFloor}
                                  title="Already sent to floor for rework. Click to view in Work Orders."
                                >
                                  <CheckCircle2 size={13} /> Already Sent to Work →
                                </button>
                              ) : (
                                <button onClick={() => handleStartRework(job)} className={styles.startBtn}>
                                  <Play size={13} fill="#ffffff" /> Send to Floor
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          role="production"
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}
    </div>
  );
}

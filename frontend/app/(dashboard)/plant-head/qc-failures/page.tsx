'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Building2,
  Clock,
  RotateCcw,
  History,
  AlertCircle,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import styles from './qc-failures.module.css';
import { backendFetch } from '@/lib/backendFetch';
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';

export default function PlantHeadQCFailuresPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [historyJobs, setHistoryJobs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);

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

      if (historyList.length === 0 && failedList.length > 0) {
        historyList = failedList;
      }

      setActiveJobs(failedList);
      setHistoryJobs(historyList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load QC failure records');
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
        qty: Number(job.quantity || 1),
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
          <ShieldAlert size={26} />
        </div>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>
            <span>Plant Head Oversight</span>
            <span className={styles.readOnlyBadge}>
              <Lock size={10} /> Read-Only
            </span>
          </div>
          <h1>QC Failures & Defect Analytics</h1>
          <p>
            Executive monitoring of production defect causes, active rework cycles, and resolution history across all plant departments
          </p>
        </div>
        <div className={styles.summaryBadges}>
          <div className={styles.summaryBadge}>
            <span className={styles.liveDot} />
            <strong>{activeJobs.length}</strong>
            <span>
              Active
              <br />
              Defects
            </span>
          </div>
          <div className={styles.summaryBadge} style={{ border: '1px solid #cbd5e1' }}>
            <History size={20} color="#475569" />
            <strong style={{ color: '#0f172a' }}>{historyJobs.length}</strong>
            <span>
              Total
              <br />
              History
            </span>
          </div>
        </div>
      </div>

      {/* ─── Panel Card ─── */}
      <div className={styles.panel}>
        {/* ─── Tabs & Controls Header ─── */}
        <div className={styles.toolbar}>
          {/* Tab Group */}
          <div className={styles.tabGroup}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'ACTIVE' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('ACTIVE')}
            >
              <AlertCircle size={14} />
              <span>Active Defect Queue</span>
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
              <span>Failure & Resolution History</span>
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
            <p>Loading QC failure data...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 12px', display: 'block' }} />
            <h3>
              {activeTab === 'ACTIVE' ? 'No Active QC Defects' : 'No Failure Records Found'}
            </h3>
            <p>
              {searchQuery
                ? `No records matched "${searchQuery}".`
                : activeTab === 'ACTIVE'
                ? 'All plant production batches are currently in good quality standing.'
                : 'No historical QC failure records found.'}
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
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {customerName}
                          </span>
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

                    {/* Action Footer (Read Only) */}
                    <div className={styles.mobileActionFooter}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(job)}
                        className={styles.btnTerminalMobile}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Eye size={13} /> View Order & Defect Details
                      </button>
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
                      <th style={{ minWidth: '170px', textAlign: 'center' }}>Resolution Status</th>
                    ) : (
                      <th style={{ minWidth: '180px' }}>QC Remarks</th>
                    )}
                    <th style={{ minWidth: '90px', textAlign: 'center' }}>Reworks</th>
                    <th style={{ minWidth: '140px' }}>Failed Date</th>
                    <th style={{ minWidth: '110px', textAlign: 'right' }}>Actions</th>
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

                        {/* Column: Resolution Status vs Remarks */}
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

                        {/* Actions (Read-Only) */}
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            type="button" 
                            onClick={() => handleOpenDetails(job)}
                            style={{ padding: '6px 12px', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={13} /> View
                          </button>
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

      {/* Order Details Modal (Plant Head Role) */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          role="plant-head"
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}
    </div>
  );
}

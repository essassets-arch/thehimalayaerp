'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PaginationControl from '@/shared/components/PaginationControl';
import {
  Truck,
  Search,
  RefreshCw,
  CheckCircle2,
  Eye,
  Building2,
  PackageCheck,
  Boxes,
  Clock,
  Send,
  RotateCcw,
  History,
  AlertCircle,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import styles from './ready-for-dispatch.module.css';
import { backendFetch } from '@/lib/backendFetch';
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';

interface ReadyJob {
  id: string;
  workOrderNumber?: string;
  quantity?: number;
  productName?: string;
  product?: string;
  productCode?: string;
  reworkCount?: number;
  qcResult?: string;
  qcRemarks?: string;
  qcTimestamp?: string;
  completedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  productionStatus?: string;
  status?: string;
  productionPlan?: {
    salesOrderId?: string;
    salesOrder?: {
      id?: string;
      orderNumber?: string;
      createdAt?: string;
      customer?: {
        id?: string;
        companyName?: string;
        name?: string;
        address?: string;
        city?: string;
        gstin?: string;
        gst?: string;
      };
      items?: any[];
    };
  };
  salesOrder?: any;
  salesOrderItem?: {
    productNameSnapshot?: string;
    productCodeSnapshot?: string;
    product?: {
      name?: string;
      sku?: string;
      code?: string;
    };
  };
  customerName?: string;
  customerAddress?: string;
  customerGst?: string;
}

interface GroupedReadyOrder {
  orderKey: string;
  salesOrderNumber: string;
  customerName: string;
  customerAddress: string;
  customerGst: string;
  orderDate: string;
  items: ReadyJob[];
  totalQty: number;
  hasRework: boolean;
  rawSalesOrder?: any;
}

export default function ReadyForDispatchPage() {
  const [activeTab, setActiveTab] = useState<'READY' | 'HISTORY'>('READY');
  const [readyJobs, setReadyJobs] = useState<ReadyJob[]>([]);
  const [historyJobs, setHistoryJobs] = useState<ReadyJob[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);
  const [sendingOrderKey, setSendingOrderKey] = useState<string | null>(null);
  const [sentOrderKeys, setSentOrderKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [readyRes, historyRes] = await Promise.allSettled([
        backendFetch('/api/backend/production/ready-for-dispatch'),
        backendFetch('/api/backend/production/ready-for-dispatch-history'),
      ]);

      let readyList: ReadyJob[] = [];
      if (readyRes.status === 'fulfilled') {
        const res: any = readyRes.value;
        readyList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];
      }

      let histList: ReadyJob[] = [];
      if (historyRes.status === 'fulfilled') {
        const res: any = historyRes.value;
        histList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];
      }

      setReadyJobs(readyList);
      setHistoryJobs(histList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load Ready for Dispatch jobs');
      setReadyJobs([]);
      setHistoryJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
  }, []);

  const getProductName = (job: ReadyJob) => {
    return (
      job.salesOrderItem?.productNameSnapshot ||
      job.salesOrderItem?.product?.name ||
      job.productName ||
      job.product ||
      'FRP High Grade Product'
    );
  };

  const handleSendToDispatch = async (group: GroupedReadyOrder) => {
    const orderNo = group.salesOrderNumber;
    const workOrderIds = group.items.map((j) => j.id);

    const confirmation = await Swal.fire({
      title: 'Send Order to Dispatch?',
      html: `
        <div style="font-size: 13.5px; color: #475569; text-align: left; margin-bottom: 8px;">
          Send all <strong>${group.items.length} product(s)</strong> (${group.totalQty} Units) in Order <strong style="color: #0f172a;">${orderNo}</strong> to Dispatch Department?
        </div>
        <div style="font-size: 12px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 6px 10px; border-radius: 6px; text-align: left;">
          ✓ Finished goods will be marked as Staged for Dispatch.
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send to Dispatch',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn',
      },
      buttonsStyling: false,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setSendingOrderKey(group.orderKey);
      await backendFetch('/api/backend/production/send-to-dispatch', {
        method: 'POST',
        body: { workOrderIds },
      });

      setSentOrderKeys((prev) => new Set([...prev, group.orderKey]));

      await Swal.fire({
        icon: 'success',
        title: 'Order Sent to Dispatch! 🚚',
        html: `Order <strong>${orderNo}</strong> (${group.totalQty} Units) has been successfully staged and sent to the Dispatch Department.`,
        timer: 3000,
        showConfirmButton: false,
      });

      fetchJobs();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send',
        text: err.message || 'Could not send order to dispatch.',
      });
    } finally {
      setSendingOrderKey(null);
    }
  };

  // Group work orders by Sales Order
  const groupJobs = (jobsList: ReadyJob[]) => {
    const groups: Record<string, GroupedReadyOrder> = {};

    jobsList.forEach((job) => {
      const rawSo =
        job.productionPlan?.salesOrder?.orderNumber ||
        job.salesOrder?.orderNumber ||
        '';

      const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
      const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;

      const so = job.productionPlan?.salesOrder || job.salesOrder;
      const leadObj = so?.quotation?.lead || so?.sourceQuotation?.lead || job.quotation?.lead || job.sourceQuotation?.lead;
      const customerObj = so?.customer || job.customer || {};
      const customerName =
        customerObj.companyName ||
        customerObj.name ||
        leadObj?.companyName ||
        leadObj?.projectName ||
        leadObj?.customerName ||
        so?.customerName ||
        job.customerName ||
        job.companyName ||
        'Consignee Client';
      const customerAddress =
        customerObj.address ||
        customerObj.city ||
        job.customerAddress ||
        'Plant Warehouse';
      const customerGst =
        customerObj.gstin ||
        customerObj.gst ||
        job.customerGst ||
        '27ABCDE4321G2Z8';

      const rawDate =
        job.createdAt ||
        (job.productionPlan?.salesOrder as any)?.createdAt;
      const orderDate = rawDate
        ? new Date(rawDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

      if (!groups[soNo]) {
        groups[soNo] = {
          orderKey: soNo,
          salesOrderNumber: soNo,
          customerName,
          customerAddress,
          customerGst,
          orderDate,
          items: [],
          totalQty: 0,
          hasRework: false,
          rawSalesOrder: job.productionPlan?.salesOrder || job.salesOrder,
        };
      }

      groups[soNo].items.push(job);
      groups[soNo].totalQty += Number(job.quantity || 1);

      if (Boolean(job.reworkCount && Number(job.reworkCount) > 0)) {
        groups[soNo].hasRework = true;
      }
    });

    return Object.values(groups).sort((a, b) => {
      const numA = parseInt((a.salesOrderNumber || '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.salesOrderNumber || '').replace(/\D/g, '')) || 0;
      if (numA && numB && numA !== numB) return numB - numA;
      return (b.salesOrderNumber || '').localeCompare(a.salesOrderNumber || '');
    });
  };

  const allReadyGroups = useMemo(() => groupJobs(readyJobs), [readyJobs]);
  const allHistoryGroups = useMemo(() => groupJobs(historyJobs), [historyJobs]);

  const readyOrdersCount = allReadyGroups.length;
  const historyOrdersCount = allHistoryGroups.length;

  const currentGroupsList = activeTab === 'READY' ? allReadyGroups : allHistoryGroups;

  const groupedOrders = useMemo(() => {
    if (!searchQuery.trim()) return currentGroupsList;

    const q = searchQuery.toLowerCase().trim();
    return currentGroupsList.filter((group) => {
      const matchHeader =
        group.salesOrderNumber.toLowerCase().includes(q) ||
        group.customerName.toLowerCase().includes(q);

      const matchItem = group.items.some((job) => {
        const prod = getProductName(job).toLowerCase();
        const wo = (job.workOrderNumber || '').toLowerCase();
        const sku = (
          job.productCode ||
          job.salesOrderItem?.productCodeSnapshot ||
          job.salesOrderItem?.product?.sku ||
          job.salesOrderItem?.product?.code ||
          ''
        ).toLowerCase();
        return prod.includes(q) || wo.includes(q) || sku.includes(q);
      });

      return matchHeader || matchItem;
    });
  }, [currentGroupsList, searchQuery]);

  const paginatedGroupedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return groupedOrders.slice(start, start + pageSize);
  }, [groupedOrders, currentPage, pageSize]);

  const totalReadyUnits = useMemo(() => {
    return groupedOrders.reduce((sum, g) => sum + g.totalQty, 0);
  }, [groupedOrders]);

  const handleOpenGroupDetails = (group: GroupedReadyOrder) => {
    const itemsList = group.items.map((job, idx) => ({
      name: getProductName(job),
      code:
        job.productCode ||
        job.salesOrderItem?.product?.sku ||
        job.workOrderNumber ||
        `P-${idx + 1}`,
      qty: Number(job.quantity || 1),
      rate: 2500,
      gst: 18,
      total: Number(job.quantity || 1) * 2500,
    }));

    const mapped = {
      ref: group.salesOrderNumber,
      orderNo: group.salesOrderNumber,
      customerName: group.customerName,
      address: group.customerAddress,
      gst: group.customerGst,
      orderDate: group.orderDate,
      salesStatus: 'Confirmed',
      productionStatus: activeTab === 'READY' ? 'Ready for Dispatch' : 'Dispatched',
      dispatchStatus: activeTab === 'READY' ? 'Ready' : 'Dispatched',
      items: itemsList,
    };
    setSelectedOrderForModal(mapped);
  };

  if (!isClient) return null;

  return (
    <div className={styles.page}>
      {/* ─── Hero Banner ─── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <Truck size={24} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Outward Logistics & Staging</span>
          <h1>Ready for Dispatch</h1>
          <p>
            Order-wise dispatch staging queue for quality-approved finished goods awaiting vehicle loading
          </p>
        </div>
        <div className={styles.summaryBadges}>
          <div className={styles.summaryBadge}>
            <span className={styles.liveDot} />
            <strong>{readyOrdersCount}</strong>
            <span>
              Ready
              <br />
              Orders
            </span>
          </div>
          <div className={styles.summaryBadge} style={{ border: '1px solid #cbd5e1' }}>
            <History size={20} color="#475569" />
            <strong style={{ color: '#0f172a' }}>{historyOrdersCount}</strong>
            <span>
              Dispatched
              <br />
              Orders
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
              className={`${styles.tabBtn} ${activeTab === 'READY' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('READY')}
            >
              <Truck size={14} />
              <span>Ready Queue</span>
              <span className={activeTab === 'READY' ? styles.tabBadge : styles.tabBadgeNeutral}>
                {readyOrdersCount}
              </span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'HISTORY' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('HISTORY')}
            >
              <History size={14} />
              <span>Dispatch History</span>
              <span className={activeTab === 'HISTORY' ? styles.tabBadge : styles.tabBadgeNeutral}>
                {historyOrdersCount}
              </span>
            </button>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.search}>
              <Search size={16} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search order #, WO, customer, product..."
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

        {/* ─── Main Content ─── */}
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading Ready for Dispatch orders...</p>
          </div>
        ) : groupedOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <PackageCheck
              size={48}
              style={{ color: '#059669', margin: '0 auto 12px', display: 'block' }}
            />
            <h3>
              {activeTab === 'READY'
                ? 'No Orders Waiting in Ready Queue'
                : 'No Historical Dispatch Records'}
            </h3>
            <p>
              {searchQuery
                ? `No orders matched "${searchQuery}".`
                : activeTab === 'READY'
                ? 'When quality control approves items on the QC Pending page, they will automatically appear here ready for dispatch.'
                : 'Orders sent to dispatch will appear in this history log.'}
            </p>
          </div>
        ) : (
          <div className={styles.ordersStack}>
            {paginatedGroupedOrders.map((group) => {
              const isSending = sendingOrderKey === group.orderKey;
              const isSent = sentOrderKeys.has(group.orderKey) || activeTab === 'HISTORY';

              return (
                <div key={group.orderKey} className={styles.orderCard}>
                  {/* ─── Order Card Header ─── */}
                  <div className={styles.orderCardHeader}>
                    <div className={styles.orderHeaderLeft}>
                      <span
                        onClick={() => handleOpenGroupDetails(group)}
                        className={styles.soTitle}
                        title="Click to view full sales order specifications"
                      >
                        {group.salesOrderNumber}
                      </span>

                      <span className={styles.customerChip}>
                        <Building2 size={13} color="#64748b" />
                        {group.customerName}
                      </span>

                      <span className={styles.qtyChip}>
                        <Boxes size={13} color="#059669" />
                        {group.totalQty} Units • {group.items.length} Product
                        {group.items.length > 1 ? 's' : ''}
                      </span>

                      {group.hasRework && (
                        <span className={styles.reworkOrderChip}>
                          🔁 Contains Rework Item
                        </span>
                      )}
                    </div>

                    <div className={styles.orderHeaderRight}>
                      <button
                        type="button"
                        onClick={() => handleOpenGroupDetails(group)}
                        className={styles.btnTerminal}
                      >
                        <Eye size={13} /> View Order
                      </button>

                      {activeTab === 'READY' && (
                        isSending ? (
                          <button type="button" disabled className={styles.btnSending}>
                            <RotateCcw size={13} className="animate-spin" /> Sending…
                          </button>
                        ) : isSent ? (
                          <button type="button" className={styles.btnSentDispatch}>
                            <CheckCircle2 size={13} /> Sent to Dispatch
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendToDispatch(group)}
                            className={styles.btnSendDispatch}
                          >
                            <Send size={13} /> Send to Dispatch
                          </button>
                        )
                      )}

                      {activeTab === 'HISTORY' && (
                        <span className={styles.btnSentDispatch}>
                          <CheckCircle2 size={13} /> Staged for Dispatch
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ─── 1. Desktop Products Table ─── */}
                  <div className={styles.desktopProductsTableWrapper}>
                    <table className={styles.desktopProductsTable}>
                      <thead>
                        <tr>
                          <th style={{ minWidth: '180px' }}>Work Order #</th>
                          <th style={{ minWidth: '260px' }}>Product Item</th>
                          <th style={{ minWidth: '110px', textAlign: 'center' }}>
                            Ready Qty
                          </th>
                          <th style={{ minWidth: '170px', textAlign: 'center' }}>
                            {activeTab === 'READY' ? 'QC Status' : 'Dispatch Status'}
                          </th>
                          <th style={{ minWidth: '170px', textAlign: 'right' }}>
                            {activeTab === 'READY' ? 'Approved Time' : 'Dispatched Time'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((job) => {
                          const prodName = getProductName(job);
                          return (
                            <tr key={job.id}>
                              {/* Work Order # */}
                              <td>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <span className={styles.woBadge}>
                                    WO: {job.workOrderNumber || '—'}
                                  </span>
                                  {Boolean(
                                    job.reworkCount && Number(job.reworkCount) > 0
                                  ) && (
                                    <span className={styles.badgeReworkPassed}>
                                      🔁 Rework #{job.reworkCount} Passed
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Product Item */}
                              <td>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: '#0f172a',
                                    }}
                                  >
                                    {prodName}
                                  </span>
                                  {(job.productCode ||
                                    job.salesOrderItem?.product?.sku) && (
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        color: '#64748b',
                                        fontFamily: 'monospace',
                                      }}
                                    >
                                      SKU:{' '}
                                      {job.productCode ||
                                        job.salesOrderItem?.product?.sku}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Ready Qty */}
                              <td style={{ textAlign: 'center' }}>
                                <span className={styles.qtyBadge}>
                                  {job.quantity || 1}{' '}
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      color: '#047857',
                                    }}
                                  >
                                    UNITS
                                  </span>
                                </span>
                              </td>

                              {/* QC / Dispatch Status */}
                              <td style={{ textAlign: 'center' }}>
                                {activeTab === 'READY' ? (
                                  <span className={styles.badgeApproved}>
                                    <CheckCircle2 size={12} /> READY FOR DISPATCH
                                  </span>
                                ) : (
                                  <span className={styles.badgeSentDispatch}>
                                    <Truck size={12} /> SENT TO DISPATCH
                                  </span>
                                )}
                              </td>

                              {/* Timestamp */}
                              <td
                                style={{
                                  fontSize: '12.5px',
                                  color: '#64748b',
                                  textAlign: 'right',
                                }}
                              >
                                {job.qcTimestamp || job.completedAt || job.updatedAt
                                  ? new Date(
                                      job.qcTimestamp || job.completedAt || job.updatedAt || ''
                                    ).toLocaleString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Staged'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ─── 2. Mobile Products List ─── */}
                  <div className={styles.mobileProductsList}>
                    {group.items.map((job) => {
                      const prodName = getProductName(job);
                      return (
                        <div key={job.id} className={styles.mobileProductCard}>
                          <div className={styles.mobileProductTop}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  flexWrap: 'wrap',
                                  marginBottom: '3px',
                                }}
                              >
                                <span className={styles.woBadge}>
                                  WO: {job.workOrderNumber || '—'}
                                </span>
                                {Boolean(
                                  job.reworkCount && Number(job.reworkCount) > 0
                                ) && (
                                  <span className={styles.badgeReworkPassed}>
                                    🔁 Rework #{job.reworkCount} Passed
                                  </span>
                                )}
                              </div>
                              <div className={styles.mobileProductItemName}>
                                {prodName}
                              </div>
                              {(job.productCode ||
                                job.salesOrderItem?.product?.sku) && (
                                <div className={styles.mobileProductItemSku}>
                                  SKU:{' '}
                                  {job.productCode ||
                                    job.salesOrderItem?.product?.sku}
                                </div>
                              )}
                            </div>

                            <div className={styles.qtyBadgeMobile}>
                              {job.quantity || 1}{' '}
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#047857',
                                }}
                              >
                                UNITS
                              </span>
                            </div>
                          </div>

                          <div className={styles.mobileProductFooter}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11.5px',
                                color: '#64748b',
                              }}
                            >
                              <Clock size={12} color="#94a3b8" />
                              <span>
                                {job.qcTimestamp || job.completedAt || job.updatedAt
                                  ? new Date(
                                      job.qcTimestamp || job.completedAt || job.updatedAt || ''
                                    ).toLocaleString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Staged'}
                              </span>
                            </div>

                            {activeTab === 'READY' ? (
                              <span
                                className={styles.badgeApproved}
                                style={{ fontSize: '10.5px' }}
                              >
                                <CheckCircle2 size={11} /> READY FOR DISPATCH
                              </span>
                            ) : (
                              <span
                                className={styles.badgeSentDispatch}
                                style={{ fontSize: '10.5px' }}
                              >
                                <Truck size={11} /> SENT TO DISPATCH
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <PaginationControl
              currentPage={currentPage}
              totalPages={Math.ceil(groupedOrders.length / pageSize) || 1}
              totalItems={groupedOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
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

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BadgeIndianRupee,
  Building2,
  CalendarDays,
  CreditCard,
  ReceiptText,
  UserRound,
  Phone,  
  Mail,
  MapPin,
  FileText,
  Truck,
  ArrowRight,
  Search,
  Copy,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '@/lib/backendFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './customer-detail.module.css';

type CustomerDetail = {
  customer: any;
  overview: {
    totalSales: number;
    outstandingBalance: number;
    creditLimit: number;
    availableCredit?: number;
    creditStatus?: string;
    paymentStatus: string;
  };
  sales?: {
    orders?: any[];
    deliveries?: any[];
  };
  crm?: {
    leads?: any[];
    quotations?: any[];
    activities?: any[];
  };
  finance?: {
    invoices?: any[];
    payments?: any[];
    ledger?: any[];
  };
  timeline?: any[];
};

export interface Customer360ViewProps {
  customerId?: string;
  basePath?: string;
}

export default function Customer360View({ customerId: propCustomerId, basePath: propBasePath }: Customer360ViewProps) {
  const params = useParams<{ id?: string; slug?: string[] }>();
  const pathname = usePathname();
  const router = useRouter();

  // Resolve customer ID from prop, or route params id, or catch-all slug
  const resolvedId = useMemo(() => {
    if (propCustomerId) return propCustomerId;
    if (params?.id) return params.id;
    if (Array.isArray(params?.slug) && params.slug.length > 1) {
      const custIdx = params.slug.indexOf('customers');
      if (custIdx !== -1 && params.slug[custIdx + 1]) {
        return params.slug[custIdx + 1];
      }
      return params.slug[1];
    }
    const pathParts = (pathname || '').split('/').filter(Boolean);
    const custIdx = pathParts.indexOf('customers');
    if (custIdx !== -1 && pathParts[custIdx + 1]) {
      return pathParts[custIdx + 1];
    }
    return '';
  }, [propCustomerId, params, pathname]);

  const basePath = useMemo(() => {
    if (propBasePath) return propBasePath;
    if (pathname?.startsWith('/supersales')) return '/supersales';
    if (pathname?.startsWith('/finance/sales')) return '/finance/sales';
    return '/sales';
  }, [propBasePath, pathname]);

  const [data, setData] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'quotations' | 'deliveries' | 'finance' | 'profile'>('orders');
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    if (!resolvedId) return;
    let active = true;
    setLoading(true);
    backendFetch<CustomerDetail>(`/api/backend/customers/${encodeURIComponent(resolvedId)}/360`)
      .then((result) => {
        if (active) {
          setData(result);
          setError('');
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message || 'Could not load customer details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resolvedId]);

  const money = (value: unknown) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (value?: string | null) => {
    if (!value) return 'Date unavailable';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? 'Date unavailable'
      : parsed.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${label} copied to clipboard`,
        showConfirmButton: false,
        timer: 1800,
      });
    } catch {
      // fallback
    }
  };

  const formatAddress = (addr: any) => {
    if (!addr) return null;
    if (typeof addr === 'string') return addr;
    const parts = [
      addr.line1 || addr.street || addr.addressLine1,
      addr.line2 || addr.addressLine2,
      addr.city,
      addr.state,
      addr.pincode || addr.postalCode,
      addr.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const customer = useMemo(() => data?.customer || {}, [data]);
  const orders = useMemo(() => data?.sales?.orders || [], [data]);
  const quotations = useMemo(() => data?.crm?.quotations || [], [data]);
  const deliveries = useMemo(() => data?.sales?.deliveries || [], [data]);
  const invoices = useMemo(() => data?.finance?.invoices || [], [data]);
  const payments = useMemo(() => data?.finance?.payments || [], [data]);

  // Dynamically calculate live totals to guarantee 100% accuracy with actual records
  const calculatedTotalSales = useMemo(() => {
    const sumFromOrders = orders.reduce(
      (sum: number, o: any) => sum + Number(o.totalAmount ?? o.total ?? o.grandTotal ?? 0),
      0
    );
    if (sumFromOrders > 0) return sumFromOrders;
    return Number(data?.overview?.totalSales || 0);
  }, [orders, data]);

  const calculatedOutstanding = useMemo(() => {
    if (data?.overview?.outstandingBalance != null && Number(data.overview.outstandingBalance) !== 0) {
      return Number(data.overview.outstandingBalance);
    }
    const orderBalance = orders.reduce((sum: number, o: any) => sum + Number(o.balanceAmount || 0), 0);
    return orderBalance;
  }, [data, orders]);

  const creditLimitValue = Number(customer.creditLimit || data?.overview?.creditLimit || 0);
  const paymentStatusValue = calculatedOutstanding > 0 ? 'OUTSTANDING' : (data?.overview?.paymentStatus || 'CURRENT');

  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return orders;
    const q = orderSearch.toLowerCase();
    return orders.filter((o: any) => {
      const num = (o.orderNumber || o.orderNo || o.id || '').toLowerCase();
      const status = (o.workflowState?.name || o.status || '').toLowerCase();
      const amt = String(o.totalAmount || o.total || '');
      return num.includes(q) || status.includes(q) || amt.includes(q);
    });
  }, [orders, orderSearch]);

  const getOrderStatusBadgeClass = (statusName: string = '') => {
    const s = statusName.toLowerCase();
    if (s.includes('approved') || s.includes('completed') || s.includes('delivered') || s.includes('paid')) {
      return styles.statusSuccess;
    }
    if (s.includes('pending') || s.includes('draft') || s.includes('hold')) {
      return styles.statusWarning;
    }
    if (s.includes('cancel') || s.includes('reject')) {
      return styles.statusDanger;
    }
    return styles.statusInfo;
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <button type="button" onClick={() => router.push(`${basePath}/customers`)} className={styles.back}>
          <ArrowLeft size={16} /> Back to customers
        </button>
        <div className={styles.state} style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }}></div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>Loading customer account...</div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className={styles.page}>
        <button type="button" onClick={() => router.push(`${basePath}/customers`)} className={styles.back}>
          <ArrowLeft size={16} /> Back to customers
        </button>
        <div className={`${styles.state} ${styles.error}`}>
          {error || 'Unable to load customer details.'}
        </div>
      </main>
    );
  }

  const customerCity = customer.city || customer.billingAddress?.city || customer.shippingAddress?.city;
  const customerState = customer.state || customer.billingAddress?.state || customer.shippingAddress?.state;

  const metrics = [
    {
      label: 'Total sales',
      value: money(calculatedTotalSales),
      subtitle: orders.length > 0 ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed` : 'No orders recorded',
      icon: BadgeIndianRupee,
      tone: 'blue',
    },
    {
      label: 'Outstanding balance',
      value: money(calculatedOutstanding),
      subtitle: calculatedOutstanding > 0 ? 'Pending collection' : 'All dues cleared',
      icon: ReceiptText,
      tone: calculatedOutstanding > 0 ? 'amber' : 'green',
    },
    {
      label: 'Credit limit',
      value: money(creditLimitValue),
      subtitle: customer.creditDays ? `${customer.creditDays} days credit term` : 'Standard terms',
      icon: CreditCard,
      tone: 'violet',
    },
    {
      label: 'Payment status',
      value: paymentStatusValue,
      subtitle: paymentStatusValue === 'CURRENT' ? 'Good credit standing' : 'Action required',
      icon: UserRound,
      tone: paymentStatusValue === 'CURRENT' ? 'green' : 'amber',
    },
  ];

  return (
    <main className={styles.page}>
      {/* ── Top Bar / Back Button ── */}
      <button type="button" onClick={() => router.push(`${basePath}/customers`)} className={styles.back}>
        <ArrowLeft size={16} /> Back to customers
      </button>

      {/* ── Customer Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.avatar}>
          <Building2 size={26} />
        </div>

        <div className={styles.identity}>
          <span className={styles.eyebrow}>Customer account</span>
          <h1>{customer.companyName || customer.name || 'Customer Details'}</h1>

          <div className={styles.meta}>
            {customer.contactPerson && (
              <span>
                <UserRound size={14} color="#64748b" />
                <strong>{customer.contactPerson}</strong>
              </span>
            )}
            {customer.customerCode && (
              <span
                className={styles.code}
                onClick={() => copyToClipboard(customer.customerCode, 'Customer code')}
                title="Click to copy code"
              >
                {customer.customerCode} <Copy size={11} style={{ marginLeft: 3, opacity: 0.7 }} />
              </span>
            )}
            {customer.phone && (
              <span>
                <Phone size={13} color="#64748b" />
                <a href={`tel:${customer.phone}`} className={styles.metaLink}>
                  {customer.phone}
                </a>
              </span>
            )}
            {customer.alternatePhone && (
              <span>
                <Phone size={13} color="#64748b" />
                <a href={`tel:${customer.alternatePhone}`} className={styles.metaLink}>
                  {customer.alternatePhone}
                </a>
              </span>
            )}
            {customer.email && (
              <span>
                <Mail size={13} color="#64748b" />
                <a href={`mailto:${customer.email}`} className={styles.metaLink}>
                  {customer.email}
                </a>
              </span>
            )}
            {customer.gstin && (
              <span
                className={styles.code}
                onClick={() => copyToClipboard(customer.gstin, 'GSTIN')}
                title="Click to copy GSTIN"
              >
                GSTIN: {customer.gstin}
              </span>
            )}
            {customer.pan && (
              <span
                className={styles.code}
                onClick={() => copyToClipboard(customer.pan, 'PAN')}
                title="Click to copy PAN"
              >
                PAN: {customer.pan}
              </span>
            )}
            {(customerCity || customerState) && (
              <span>
                <MapPin size={13} color="#64748b" />
                {[customerCity, customerState].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <span className={`${styles.status} ${customer.status === 'INACTIVE' ? styles.inactive : ''}`}>
            <span className={`${styles.statusDot} ${customer.status === 'INACTIVE' ? styles.inactiveDot : ''}`} />
            {customer.status === 'INACTIVE' ? 'Inactive' : 'Active customer'}
          </span>
        </div>
      </section>

      {/* ── 4 KPI Financial Metrics ── */}
      <section className={styles.metrics} aria-label="Customer account summary">
        {metrics.map(({ label, value, subtitle, icon: Icon, tone }) => (
          <Card className={styles.metric} key={label}>
            <CardHeader className={styles.metricHead}>
              <CardTitle>{label}</CardTitle>
              <span className={`${styles.metricIcon} ${styles[`tone_${tone}`]}`}>
                <Icon size={17} />
              </span>
            </CardHeader>
            <CardContent className={styles.metricValue}>
              {value}
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                {subtitle}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Interactive 360° Tabs ── */}
      <div className={styles.mainCard}>
        {/* Navigation Tabs Header */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Sales Orders
            <span className={styles.tabBadge}>{orders.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'quotations' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('quotations')}
          >
            📑 Quotations
            <span className={styles.tabBadge}>{quotations.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'deliveries' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('deliveries')}
          >
            🚚 Deliveries
            <span className={styles.tabBadge}>{deliveries.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'finance' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            💳 Invoices &amp; Ledger
            <span className={styles.tabBadge}>{invoices.length + payments.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            🏢 Profile &amp; Address
          </button>
        </div>

        {/* ── TAB 1: SALES ORDERS ── */}
        {activeTab === 'orders' && (
          <>
            <div className={styles.ordersHeader}>
              <div>
                <span className={styles.eyebrow}>Sales history</span>
                <CardTitle>Orders for this customer</CardTitle>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className={styles.searchBox}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by order #, status..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <span className={styles.ordersCount}>
                  {filteredOrders.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
            </div>

            <div className={styles.ordersList}>
              {filteredOrders.length === 0 ? (
                <div className={styles.ordersEmpty}>
                  {orderSearch.trim()
                    ? `No orders matching "${orderSearch}".`
                    : 'No orders are recorded for this customer yet.'}
                </div>
              ) : (
                filteredOrders.map((order: any) => {
                  const orderId = order.id;
                  const orderNum = order.orderNumber || order.orderNo || order.id;
                  const statusName = order.workflowState?.name || order.status || 'Order';
                  const itemsCount = order.items?.length || 0;
                  const hasDispatches = order.dispatches?.length > 0;

                  return (
                    <article
                      key={orderId}
                      className={styles.orderRow}
                      onClick={() => router.push(`${basePath}/orders/${orderId}`)}
                      title={`Click to view details for sales order ${orderNum}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') router.push(`${basePath}/orders/${orderId}`);
                      }}
                    >
                      <div className={styles.orderMain}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={styles.orderNumber}>{orderNum}</span>
                          {itemsCount > 0 && (
                            <span className={styles.itemBadge}>
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                            </span>
                          )}
                          {hasDispatches && (
                            <span className={styles.dispatchBadge}>
                              🚚 Dispatched
                            </span>
                          )}
                        </div>
                        <span className={styles.orderDate}>
                          <CalendarDays size={14} />
                          {formatDate(order.orderDate || order.createdAt)}
                        </span>
                      </div>

                      <div className={styles.orderRight}>
                        <span className={styles.orderTotal}>
                          {money(order.totalAmount ?? order.total ?? order.grandTotal)}
                        </span>
                        {order.balanceAmount != null && Number(order.balanceAmount) > 0 ? (
                          <span className={styles.orderBalance}>
                            Balance: {money(order.balanceAmount)}
                          </span>
                        ) : (
                          <span className={styles.orderPaid}>
                            ✓ Balance: ₹0.00
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`${styles.orderStatus} ${getOrderStatusBadgeClass(statusName)}`}>
                          {statusName}
                        </span>
                        <span className={styles.orderActionLink}>
                          View <ArrowRight size={14} />
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── TAB 2: QUOTATIONS ── */}
        {activeTab === 'quotations' && (
          <>
            <div className={styles.ordersHeader}>
              <div>
                <span className={styles.eyebrow}>CRM &amp; Proposals</span>
                <CardTitle>Customer Quotations ({quotations.length})</CardTitle>
              </div>
            </div>

            <div className={styles.ordersList}>
              {quotations.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={34} color="#94a3b8" />
                  <p>No quotations recorded for this customer yet.</p>
                </div>
              ) : (
                quotations.map((quote: any) => {
                  const statusName = quote.workflowState?.name || quote.status || 'Draft';
                  return (
                    <article
                      key={quote.id}
                      className={styles.orderRow}
                      onClick={() => router.push(`${basePath}/quotations`)}
                      title="Click to open Quotations"
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.orderMain}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={styles.orderNumber}>{quote.quotationNumber || quote.id}</span>
                          {quote.items?.length > 0 && (
                            <span className={styles.itemBadge}>
                              {quote.items.length} {quote.items.length === 1 ? 'item' : 'items'}
                            </span>
                          )}
                        </div>
                        <span className={styles.orderDate}>
                          <CalendarDays size={14} />
                          {formatDate(quote.date || quote.createdAt)}
                        </span>
                      </div>

                      <div className={styles.orderRight}>
                        <span className={styles.orderTotal}>
                          {money(quote.total || quote.grandTotal || 0)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`${styles.orderStatus} ${getOrderStatusBadgeClass(statusName)}`}>
                          {statusName}
                        </span>
                        <span className={styles.orderActionLink}>
                          View <ArrowRight size={14} />
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── TAB 3: DELIVERIES ── */}
        {activeTab === 'deliveries' && (
          <>
            <div className={styles.ordersHeader}>
              <div>
                <span className={styles.eyebrow}>Fulfillment</span>
                <CardTitle>Delivery Dispatches &amp; Shipments ({deliveries.length})</CardTitle>
              </div>
            </div>

            <div className={styles.ordersList}>
              {deliveries.length === 0 ? (
                <div className={styles.emptyState}>
                  <Truck size={34} color="#94a3b8" />
                  <p>No delivery shipments recorded for this customer yet.</p>
                </div>
              ) : (
                deliveries.map((d: any) => (
                  <article key={d.id} className={styles.orderRow} style={{ cursor: 'default' }}>
                    <div className={styles.orderMain}>
                      <span className={styles.orderNumber}>
                        🚚 {d.dispatchNumber || d.dispatchNo || d.id}
                      </span>
                      <span className={styles.orderDate}>
                        <CalendarDays size={14} />
                        {formatDate(d.dispatchDate || d.createdAt)}
                      </span>
                    </div>

                    <div className={styles.orderRight}>
                      {d.vehicleNumber && (
                        <span style={{ fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                          Vehicle: {d.vehicleNumber}
                        </span>
                      )}
                      {d.driverName && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Driver: {d.driverName}
                        </span>
                      )}
                    </div>

                    <span className={`${styles.orderStatus} ${getOrderStatusBadgeClass(d.status || 'Dispatched')}`}>
                      {d.status || 'Dispatched'}
                    </span>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {/* ── TAB 4: INVOICES & FINANCIALS ── */}
        {activeTab === 'finance' && (
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Financial Overview Strip */}
            <div className={styles.financialBanner}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Billed</span>
                <strong style={{ display: 'block', fontSize: '18px', color: '#0f172a', marginTop: '2px' }}>{money(calculatedTotalSales)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Outstanding Balance</span>
                <strong style={{ display: 'block', fontSize: '18px', color: calculatedOutstanding > 0 ? '#e11d48' : '#16a34a', marginTop: '2px' }}>
                  {money(calculatedOutstanding)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Available Credit</span>
                <strong style={{ display: 'block', fontSize: '18px', color: '#0284c7', marginTop: '2px' }}>
                  {money(creditLimitValue > 0 ? Math.max(0, creditLimitValue - calculatedOutstanding) : 0)}
                </strong>
              </div>
            </div>

            {/* Invoices Table */}
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                Sales Invoices ({invoices.length})
              </h4>
              {invoices.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No invoices generated yet.</p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.finTable}>
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                        <th style={{ textAlign: 'right' }}>Balance Due</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td><strong>{inv.invoiceNumber || inv.invoiceNo || inv.id}</strong></td>
                          <td>{formatDate(inv.invoiceDate || inv.createdAt)}</td>
                          <td style={{ textAlign: 'right' }}>{money(inv.totalAmount || inv.total || 0)}</td>
                          <td style={{ textAlign: 'right', color: Number(inv.balanceAmount || 0) > 0 ? '#e11d48' : '#16a34a', fontWeight: 750 }}>
                            {money(inv.balanceAmount || 0)}
                          </td>
                          <td>
                            <span className={`${styles.orderStatus} ${getOrderStatusBadgeClass(inv.workflowState?.name || inv.status)}`}>
                              {inv.workflowState?.name || inv.status || 'Invoice'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payments Table */}
            {payments.length > 0 && (
              <div>
                <h4 style={{ margin: '14px 0 12px', fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                  Customer Receipts &amp; Payments ({payments.length})
                </h4>
                <div className={styles.tableWrapper}>
                  <table className={styles.finTable}>
                    <thead>
                      <tr>
                        <th>Receipt / Ref</th>
                        <th>Date</th>
                        <th>Payment Mode</th>
                        <th style={{ textAlign: 'right' }}>Amount Paid</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any) => (
                        <tr key={p.id}>
                          <td><strong>{p.receiptNumber || p.referenceNumber || p.id}</strong></td>
                          <td>{formatDate(p.paymentDate || p.createdAt)}</td>
                          <td>{p.paymentMode || p.method || 'Bank Transfer'}</td>
                          <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 750 }}>
                            {money(p.amount || 0)}
                          </td>
                          <td>
                            <span className={`${styles.orderStatus} ${styles.statusSuccess}`}>
                              {p.workflowState?.name || p.status || 'Received'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: PROFILE & ADDRESS ── */}
        {activeTab === 'profile' && (
          <div style={{ padding: '20px 22px' }}>
            <div className={styles.profileGrid}>
              {/* Billing Address Card */}
              <div className={styles.profileCard}>
                <div className={styles.profileCardHeader}>
                  <Building2 size={16} color="#0284c7" />
                  <h4>Billing Address</h4>
                </div>
                <div className={styles.profileCardBody}>
                  {formatAddress(customer.billingAddress) ? (
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                      {formatAddress(customer.billingAddress)}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                      {customer.city ? `${customer.city}, ${customer.state || ''}` : 'No billing address recorded.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className={styles.profileCard}>
                <div className={styles.profileCardHeader}>
                  <MapPin size={16} color="#059669" />
                  <h4>Shipping Address</h4>
                </div>
                <div className={styles.profileCardBody}>
                  {formatAddress(customer.shippingAddress) ? (
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                      {formatAddress(customer.shippingAddress)}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                      Same as billing address or not specified.
                    </p>
                  )}
                </div>
              </div>

              {/* Tax & Identification */}
              <div className={styles.profileCard}>
                <div className={styles.profileCardHeader}>
                  <ReceiptText size={16} color="#7c3aed" />
                  <h4>Tax &amp; Identification</h4>
                </div>
                <div className={styles.profileCardBody}>
                  <div className={styles.profileRow}>
                    <span>GSTIN:</span>
                    <strong>{customer.gstin || customer.gstNumber || 'Not Provided'}</strong>
                  </div>
                  <div className={styles.profileRow}>
                    <span>PAN:</span>
                    <strong>{customer.pan || 'Not Provided'}</strong>
                  </div>
                  <div className={styles.profileRow}>
                    <span>Customer Code:</span>
                    <code>{customer.customerCode || '—'}</code>
                  </div>
                </div>
              </div>

              {/* Credit Terms */}
              <div className={styles.profileCard}>
                <div className={styles.profileCardHeader}>
                  <CreditCard size={16} color="#d97706" />
                  <h4>Commercial Terms</h4>
                </div>
                <div className={styles.profileCardBody}>
                  <div className={styles.profileRow}>
                    <span>Credit Limit:</span>
                    <strong>{money(customer.creditLimit || 0)}</strong>
                  </div>
                  <div className={styles.profileRow}>
                    <span>Credit Period:</span>
                    <strong>{customer.creditDays ?? customer.creditPeriodDays ?? 0} Days</strong>
                  </div>
                  <div className={styles.profileRow}>
                    <span>Payment Terms:</span>
                    <strong>{customer.paymentTerms ? `${customer.paymentTerms} Days` : 'Standard'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {customer.notes && (
              <div style={{ marginTop: '18px', padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Account Notes</span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{customer.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

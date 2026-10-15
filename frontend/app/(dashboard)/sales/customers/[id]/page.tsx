'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeIndianRupee, Building2, CalendarDays, CreditCard, ReceiptText, UserRound } from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './customer-detail.module.css';

type CustomerDetail = {
  customer: any;
  overview: { totalSales: number; outstandingBalance: number; creditLimit: number; paymentStatus: string };
  sales: { orders: any[] };
};

export default function Customer360Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    backendFetch<CustomerDetail>(`/api/backend/customers/${encodeURIComponent(id)}/360`)
      .then((result) => { if (active) setData(result); })
      .catch((reason) => { if (active) setError(reason.message || 'Could not load customer details.'); });
    return () => { active = false; };
  }, [id]);

  const money = (value: unknown) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2,
  }).format(Number(value) || 0);

  if (error) return <div className={`${styles.state} ${styles.error}`}>{error}</div>;
  if (!data) return <div className={styles.state}>Loading customer details…</div>;

  const customer = data.customer || {};
  const orders = data.sales?.orders || [];
  const metrics = [
    { label: 'Total sales', value: money(data.overview.totalSales), icon: BadgeIndianRupee, tone: 'blue' },
    { label: 'Outstanding balance', value: money(data.overview.outstandingBalance), icon: ReceiptText, tone: 'amber' },
    { label: 'Credit limit', value: money(data.overview.creditLimit), icon: CreditCard, tone: 'violet' },
    { label: 'Payment status', value: data.overview.paymentStatus, icon: UserRound, tone: data.overview.paymentStatus === 'CURRENT' ? 'green' : 'amber' },
  ];

  return (
    <main className={styles.page}>
      <button type="button" onClick={() => router.push('/sales/customers')} className={styles.back}>
        <ArrowLeft size={16} /> Back to customers
      </button>

      <section className={styles.hero}>
        <div className={styles.avatar}><Building2 size={25} /></div>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>Customer account</span>
          <h1>{customer.companyName || customer.name || 'Customer Details'}</h1>
          <div className={styles.meta}>
            {customer.contactPerson && <span><UserRound size={14} />{customer.contactPerson}</span>}
            {customer.customerCode && <span className={styles.code}>{customer.customerCode}</span>}
            {customer.phone && <span>{customer.phone}</span>}
            {customer.email && <span>{customer.email}</span>}
          </div>
        </div>
        <span className={`${styles.status} ${customer.status === 'INACTIVE' ? styles.inactive : ''}`}>
          {customer.status === 'INACTIVE' ? 'Inactive' : 'Active customer'}
        </span>
      </section>

      <section className={styles.metrics} aria-label="Customer account summary">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <Card className={styles.metric} key={label}>
            <CardHeader className={styles.metricHead}>
              <CardTitle>{label}</CardTitle>
              <span className={`${styles.metricIcon} ${styles[`tone_${tone}`]}`}><Icon size={17} /></span>
            </CardHeader>
            <CardContent className={styles.metricValue}>{value}</CardContent>
          </Card>
        ))}
      </section>

      <Card className={styles.ordersCard}>
        <CardHeader className={styles.ordersHeader}>
          <div>
            <span className={styles.eyebrow}>Sales history</span>
            <CardTitle>Orders for this customer</CardTitle>
          </div>
          <span className={styles.ordersCount}>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
        </CardHeader>
        <CardContent className={styles.ordersList}>
          {orders.length === 0 ? (
            <div className={styles.ordersEmpty}>No orders are recorded for this customer yet.</div>
          ) : orders.map((order) => (
            <article key={order.id} className={styles.orderRow}>
              <div className={styles.orderMain}>
                <span className={styles.orderNumber}>{order.orderNumber || order.orderNo || order.id}</span>
                <span className={styles.orderDate}><CalendarDays size={14} />{formatDate(order.orderDate || order.createdAt)}</span>
              </div>
              <div className={styles.orderRight}>
                <span className={styles.orderTotal}>{money(order.totalAmount ?? order.total ?? order.grandTotal)}</span>
                {order.balanceAmount != null && <span className={styles.orderBalance}>Balance {money(order.balanceAmount)}</span>}
              </div>
              <span className={styles.orderStatus}>{order.workflowState?.name || order.status || 'Order'}</span>
            </article>
          ))}
        </CardContent>
      </Card>

    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Date unavailable';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

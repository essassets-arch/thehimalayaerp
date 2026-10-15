'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { backendFetch } from '@/lib/backendFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Customer360Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    backendFetch(`/api/backend/customers/${encodeURIComponent(id)}/360`)
      .then(setData)
      .catch((reason) => setError(reason.message));
  }, [id]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Loading customer history…</div>;

  const money = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div>
        <button type="button" onClick={() => router.push('/sales/customers')} className="mb-3 text-sm font-medium text-blue-700 hover:underline">
          Back to customers
        </button>
        <h1 className="text-2xl font-semibold">{data?.customer?.companyName || data?.customer?.name || 'Customer Details'}</h1>
        {data?.customer?.contactPerson && <p className="mt-1 text-sm text-muted-foreground">Contact: {data.customer.contactPerson}</p>}
        <p className="text-sm text-muted-foreground">{data?.customer?.customerCode || '—'}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total sales', money(data.overview.totalSales)],
          ['Outstanding', money(data.overview.outstandingBalance)],
          ['Credit limit', money(data.overview.creditLimit)],
          ['Payment status', data.overview.paymentStatus],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="text-xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>
      <RecordSection title={`Orders for this customer (${data.sales.orders.length})`} records={data.sales.orders} label="orderNumber" />
    </div>
  );
}

function RecordSection({ title, records, label }: { title: string; records: any[]; label: string }) {
  const money = (value: unknown) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
  return (
    <Card className="mb-4">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {!records.length && <p className="text-sm text-muted-foreground">No records</p>}
        {records.map((record) => (
          <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 text-sm">
            <div>
              <div className="font-medium">{record[label] || record.entityType || record.id}</div>
              {record.orderDate && <div className="text-xs text-muted-foreground">{new Date(record.orderDate).toLocaleDateString('en-IN')}</div>}
            </div>
            <div className="text-right">
              {(record.totalAmount != null || record.total != null || record.grandTotal != null) && <div className="font-semibold">{money(record.totalAmount ?? record.total ?? record.grandTotal)}</div>}
              <div className="text-xs text-muted-foreground">
                {record.workflowState?.name || record.status || record.type || ''}
                {record.balanceAmount != null && ` · Balance ${money(record.balanceAmount)}`}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

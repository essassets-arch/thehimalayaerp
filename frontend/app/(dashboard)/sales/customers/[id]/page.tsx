'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { backendFetch } from '@/lib/backendFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Customer360Page() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    backendFetch(`/api/backend/customers/${id}/360`)
      .then(setData)
      .catch((reason) => setError(reason.message));
  }, [id]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Loading customer history…</div>;

  const money = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{data.customer.companyName}</h1>
        <p className="text-sm text-muted-foreground">{data.customer.customerCode}</p>
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
      <Tabs defaultValue="crm">
        <TabsList>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="crm">
          <RecordSection title="Leads" records={data.crm.leads} label="leadNumber" />
          <RecordSection title="Quotations" records={data.crm.quotations} label="quotationNumber" />
        </TabsContent>
        <TabsContent value="sales">
          <RecordSection title="Orders" records={data.sales.orders} label="orderNumber" />
          <RecordSection title="Deliveries" records={data.sales.deliveries} label="dispatchNo" />
        </TabsContent>
        <TabsContent value="finance">
          <RecordSection title="Invoices" records={data.finance.invoices} label="invoiceNumber" />
          <RecordSection title="Payments" records={data.finance.payments} label="paymentNo" />
          <RecordSection title="Ledger" records={data.finance.ledger} label="description" />
        </TabsContent>
        <TabsContent value="timeline">
          <RecordSection title="Complete history" records={data.timeline} label="action" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecordSection({ title, records, label }: { title: string; records: any[]; label: string }) {
  return (
    <Card className="mb-4">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {!records.length && <p className="text-sm text-muted-foreground">No records</p>}
        {records.map((record) => (
          <div key={record.id} className="flex justify-between border-b py-2 text-sm">
            <span>{record[label] || record.entityType || record.id}</span>
            <span className="text-muted-foreground">
              {record.workflowState?.name || record.status || record.type || ''}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

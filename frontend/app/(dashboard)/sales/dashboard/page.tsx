'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/lib/backendFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SalesDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    backendFetch('/api/backend/sales/dashboard').then(setData).catch((reason) => setError(reason.message));
  }, []);
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Loading sales dashboard…</div>;

  const metrics = [
    ['Total leads', data.metrics.totalLeads],
    ['Lead conversion', `${data.metrics.leadConversionRate.toFixed(1)}%`],
    ['Quotation acceptance', `${data.metrics.quotationAcceptanceRate.toFixed(1)}%`],
    ['Sales revenue', `₹${data.metrics.salesRevenue.toLocaleString('en-IN')}`],
    ['Outstanding', `₹${data.metrics.outstandingAmount.toLocaleString('en-IN')}`],
    ['Forecast', `₹${data.metrics.forecastRevenue.toLocaleString('en-IN')}`],
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Sales command center</h1>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-xs">{label}</CardTitle></CardHeader>
            <CardContent className="text-xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Lead pipeline</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {data.pipeline.map((stage: any) => (
            <div key={stage.state} className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">{stage.label}</div>
              <div className="text-2xl font-semibold">{stage.count}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Salesperson performance</CardTitle></CardHeader>
        <CardContent>
          {data.salespersonPerformance.map((person: any) => (
            <div key={person.userId} className="grid grid-cols-4 border-b py-2 text-sm">
              <span>{person.name}</span><span>{person.leads} leads</span>
              <span>{person.won} won</span><span>₹{person.revenue.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

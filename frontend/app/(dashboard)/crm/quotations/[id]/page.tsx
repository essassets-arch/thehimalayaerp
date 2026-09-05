'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, FileText, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { backendFetch } from '@/lib/backendFetch';

export default function QuotationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const fetchQuotation = React.useCallback(async () => {
    if (!params?.id) return;
    try {
      const data = await backendFetch(`/api/backend/crm/quotations/${params.id}`);
      setQuotation(data);
    } catch (e) {
      toast.error('Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const newQuote = await backendFetch<any>(`/api/backend/crm/quotations/${params.id}/duplicate`, {
        method: 'POST',
      });
      toast.success(`Created version ${newQuote.version}`);
      router.push(`/crm/quotations/${newQuote.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDuplicating(false);
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const so = await backendFetch<any>(`/api/backend/crm/quotations/${params.id}/convert`, {
        method: 'POST',
      });
      toast.success(`Converted! Sales Order ${so.orderNumber} created.`);
      fetchQuotation();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quotation) return <div>Quotation not found</div>;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{quotation.quotationNumber}</h2>
              <Badge variant="outline" className="text-sm font-mono">v{quotation.version}</Badge>
              <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-none border-0">
                {quotation.workflowState?.name}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              For Lead: {quotation.lead?.companyName || 'Unknown Company'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quotation.workflowState?.code !== 'SUPERSEDED' && quotation.workflowState?.code !== 'CONVERTED_TO_SO' && (
            <Button variant="outline" onClick={handleDuplicate} disabled={duplicating}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate Version
            </Button>
          )}

          {quotation.workflowState?.code === 'APPROVED' && !quotation.salesOrder && !quotation.salesOrderId && (!Array.isArray(quotation.sourceSalesOrders) || quotation.sourceSalesOrders.length === 0) && (
            <Button onClick={handleConvert} disabled={converting} className="bg-green-600 hover:bg-green-700">
              <ArrowRightCircle className="mr-2 h-4 w-4" /> Convert to Sales Order
            </Button>
          )}

          {(quotation.workflowState?.code === 'CONVERTED_TO_SO' || quotation.salesOrder || quotation.salesOrderId || (Array.isArray(quotation.sourceSalesOrders) && quotation.sourceSalesOrders.length > 0)) && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 flex items-center gap-2 shadow-none">
              <CheckCircle2 className="h-4 w-4" /> Order Booked {quotation.salesOrder?.orderNumber ? `(${quotation.salesOrder.orderNumber})` : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" /> Quotation Items
            </CardTitle>
            <CardDescription>Snapshot pricing applied. These items will be cloned to the Sales Order upon conversion.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Product / Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                      <TableCell className="text-right font-mono">₹{Number(item.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-red-600 font-mono">-₹{Number(item.discount).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">₹{Number(item.tax).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold font-mono">₹{Number(item.lineTotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {(!quotation.items || quotation.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No items added to this quotation.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end mt-6">
              <div className="w-64 space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{Number(quotation.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount</span>
                  <span className="font-mono">-₹{Number(quotation.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax</span>
                  <span className="font-mono">₹{Number(quotation.tax).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span className="font-mono">₹{Number(quotation.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</div>
              <Badge variant="outline" className="bg-slate-50">{quotation.workflowState?.name}</Badge>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Validity</div>
              <div className="text-sm font-medium">
                {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            {quotation.parentQuotationId && (
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Revision Of</div>
                <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push(`/crm/quotations/${quotation.parentQuotationId}`)}>
                  View Previous Version
                </Button>
              </div>
            )}
            {quotation.remarks && (
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Remarks</div>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-md">{quotation.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { EntityHeader } from '@/components/erp/common/EntityHeader';
import { ActionButtons } from '../components/ActionButtons';
import { WorkflowTimeline } from '@/components/erp/workflow/WorkflowTimeline';
import { CommentPanel } from '@/components/erp/communication/CommentPanel';
import { AttachmentUploader } from '@/components/erp/communication/AttachmentUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/finance/invoices/${id}`);
      return res.data;
    }
  });

  if (isLoading || !invoice) {
    return <div className="p-8">Loading invoice details...</div>;
  }

  const status = invoice.workflowState?.code || invoice.status;
  const so = invoice.salesOrder;
  const customer = so.customer;

  const totalAmount = invoice.items?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;
  const paidAmount = invoice.paymentAllocations?.reduce((sum: number, alloc: any) => sum + Number(alloc.amount), 0) || 0;

  const headerDetails = [
    { label: 'Sales Order', value: so.orderNumber },
    { label: 'Customer', value: customer.companyName },
    { label: 'Total Amount', value: `₹${totalAmount.toFixed(2)}` },
    { label: 'Paid Amount', value: `₹${paidAmount.toFixed(2)}` },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
      </Button>

      <EntityHeader 
        title={`Invoice: ${invoice.id.slice(0, 8)}`}
        status={status}
        details={headerDetails}
        actions={<ActionButtons invoiceId={id} status={status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.salesOrderItem?.productId || 'Unknown'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{Number(item.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4 text-lg font-bold">
                Total: ₹{totalAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.paymentAllocations?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments allocated yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.paymentAllocations?.map((alloc: any) => (
                      <TableRow key={alloc.id}>
                        <TableCell className="font-medium">{alloc.payment?.paymentNo}</TableCell>
                        <TableCell>{new Date(alloc.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">₹{Number(alloc.amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CommentPanel entityType="INVOICE" entityId={id} />
            <AttachmentUploader entityType="INVOICE" entityId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="INVOICE" entityId={id} />
        </div>
      </div>
    </div>
  );
}

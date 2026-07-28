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

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/finance/payments/${id}`);
      return res.data;
    }
  });

  if (isLoading || !payment) {
    return <div className="p-8">Loading payment details...</div>;
  }

  const status = payment.workflowState?.code || payment.status;
  const customer = payment.customer;

  const allocatedAmount = payment.allocations?.reduce((sum: number, alloc: any) => sum + Number(alloc.amount), 0) || 0;
  const unallocatedAmount = Number(payment.amount) - allocatedAmount;

  const headerDetails = [
    { label: 'Customer', value: customer.companyName },
    { label: 'Total Amount', value: `₹${Number(payment.amount).toFixed(2)}` },
    { label: 'Allocated Amount', value: `₹${allocatedAmount.toFixed(2)}` },
    { label: 'Unallocated Amount', value: `₹${unallocatedAmount.toFixed(2)}` },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
      </Button>

      <EntityHeader 
        title={`Payment: ${payment.paymentNo}`}
        status={status}
        details={headerDetails}
        actions={<ActionButtons paymentId={id} status={status} customerId={customer.id} unallocatedAmount={unallocatedAmount} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {payment.allocations?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No funds allocated to invoices yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date Allocated</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payment.allocations?.map((alloc: any) => (
                      <TableRow key={alloc.id}>
                        <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => router.push(`/finance/invoices/${alloc.invoiceId}`)}>
                          {alloc.invoice?.id?.slice(0,8) || alloc.invoiceId.slice(0,8)}
                        </TableCell>
                        <TableCell>{new Date(alloc.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-bold">₹{Number(alloc.amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CommentPanel entityType="CUSTOMER_PAYMENT" entityId={id} />
            <AttachmentUploader entityType="CUSTOMER_PAYMENT" entityId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="CUSTOMER_PAYMENT" entityId={id} />
        </div>
      </div>
    </div>
  );
}

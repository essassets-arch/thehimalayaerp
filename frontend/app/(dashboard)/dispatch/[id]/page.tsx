'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { EntityHeader } from '@/components/erp/common/EntityHeader';
import { ActionButtons } from '../components/ActionButtons';
import { WorkflowTimeline } from '@/components/erp/workflow/WorkflowTimeline';
import { AttachmentUploader } from '@/components/erp/communication/AttachmentUploader';
import { CommentPanel } from '@/components/erp/communication/CommentPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DispatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: dispatch, isLoading } = useQuery({
    queryKey: ['dispatch', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/logistics/dispatches/${id}`);
      return res.data;
    }
  });

  if (isLoading || !dispatch) {
    return <div className="p-8">Loading dispatch details...</div>;
  }

  const status = dispatch.workflowState?.code || dispatch.status;
  const so = dispatch.salesOrder;

  const headerDetails = [
    { label: 'Sales Order', value: so.orderNumber },
    { label: 'Customer', value: so.customer.companyName },
    { label: 'Dispatched At', value: dispatch.dispatchedAt ? new Date(dispatch.dispatchedAt).toLocaleString() : 'Pending' },
    { label: 'Delivered At', value: dispatch.deliveredAt ? new Date(dispatch.deliveredAt).toLocaleString() : 'Pending' },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dispatches
      </Button>

      <EntityHeader 
        title={`Dispatch Note: ${dispatch.dispatchNo}`}
        status={status}
        details={headerDetails}
        actions={<ActionButtons dispatchId={id} status={status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispatched Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Dispatch Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatch.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.salesOrderItem?.productId || 'Unknown'}</TableCell>
                      <TableCell>{item.salesOrderItem?.unit || 'N/A'}</TableCell>
                      <TableCell className="font-bold">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CommentPanel entityType="DISPATCH" entityId={id} />
            <AttachmentUploader entityType="DISPATCH" entityId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="DISPATCH" entityId={id} />
        </div>
      </div>
    </div>
  );
}

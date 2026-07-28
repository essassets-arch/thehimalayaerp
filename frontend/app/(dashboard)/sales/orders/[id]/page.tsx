'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { EntityHeader } from '@/components/erp/common/EntityHeader';
import { EntitySummaryCard, SummaryItem } from '@/components/erp/common/EntitySummaryCard';
import { WorkflowTimeline } from '@/components/erp/workflow/WorkflowTimeline';
import { WorkflowActionDialog } from '@/components/erp/workflow/WorkflowActionDialog';
import { CommentPanel } from '@/components/erp/communication/CommentPanel';
import { AttachmentUploader } from '@/components/erp/communication/AttachmentUploader';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText } from 'lucide-react';
import { ActionButtons } from '../components/ActionButtons';

export default function SalesOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['sales-orders', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/sales/orders/${id}`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  const summaryItems: SummaryItem[] = [
    { label: 'Customer', value: order.customer?.companyName },
    { label: 'Order Date', value: order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy') : 'N/A' },
    { label: 'Total Amount', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalAmount || 0) },
    { label: 'Created By', value: 'System User' }
  ];

  const status = order.workflowState?.status;

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4 text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Button>

      <EntityHeader 
        title={`Sales Order ${order.orderNumber}`}
        status={status}
        actions={
          <ActionButtons orderId={id} status={status} />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Order Items ({order.items?.length || 0})</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <EntitySummaryCard title="Order Details" items={summaryItems} />
              
              {order.remarks && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Remarks</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.remarks}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Line Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productNameSnapshot || item.productId}</TableCell>
                          <TableCell className="text-right">{item.orderedQuantity} {item.unit}</TableCell>
                          <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">${Number(item.lineTotal).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-6">
              <CommentPanel entityType="SALES_ORDER" entityId={id} />
              <AttachmentUploader entityType="SALES_ORDER" entityId={id} />
            </TabsContent>

            <TabsContent value="fulfillment">
              <Card>
                <CardContent className="p-12 text-center text-gray-500 flex flex-col items-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p>Production & Dispatch information will appear here once the order is sent to the plant.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="SALES_ORDER" entityId={id} />
        </div>
      </div>

    </div>
  );
}

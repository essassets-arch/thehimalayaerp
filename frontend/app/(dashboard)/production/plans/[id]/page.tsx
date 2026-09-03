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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductionPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: plan, isLoading } = useQuery({
    queryKey: ['production-plans', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/production/plans/${id}`);
      return res.data;
    }
  });

  if (isLoading || !plan) {
    return <div className="p-8">Loading plan details...</div>;
  }

  const status = plan.workflowState?.code || plan.status;

  const headerDetails = [
    { label: 'Sales Order', value: plan.salesOrder?.orderNumber || 'N/A' },
    { label: 'Customer', value: plan.salesOrder?.customer?.companyName || plan.salesOrder?.customer?.name || 'N/A' },
    { label: 'Start Date', value: plan.plannedStartDate ? new Date(plan.plannedStartDate).toLocaleDateString() : 'TBD' },
    { label: 'End Date', value: plan.plannedEndDate ? new Date(plan.plannedEndDate).toLocaleDateString() : 'TBD' },
    { label: 'Production Line', value: plan.productionLine || 'Unassigned' },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
      </Button>

      <EntityHeader 
        title={`Production Plan ${plan.planNumber}`}
        status={status}
        details={headerDetails}
        actions={<ActionButtons planId={id} status={status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="items">
            <TabsList>
              <TabsTrigger value="items">Items to Produce</TabsTrigger>
              <TabsTrigger value="workorders">Work Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.salesOrder.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productId}</TableCell>
                          <TableCell>{item.orderedQuantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workorders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Work Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {plan.workOrders && plan.workOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>WO Number</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.workOrders.map((wo: any) => (
                          <TableRow key={wo.id}>
                            <TableCell>{wo.workOrderNumber}</TableCell>
                            <TableCell>{wo.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 py-4 text-center text-sm">No Work Orders generated yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CommentPanel entityType="PRODUCTION_PLAN" entityId={id} />
            <AttachmentUploader entityType="PRODUCTION_PLAN" entityId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="PRODUCTION_PLAN" entityId={id} />
        </div>
      </div>
    </div>
  );
}

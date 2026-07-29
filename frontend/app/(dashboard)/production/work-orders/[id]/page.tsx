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
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WorkOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: wo, isLoading } = useQuery({
    queryKey: ['work-orders', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/production/work-orders/${id}`);
      return res.data;
    }
  });

  if (isLoading || !wo) {
    return <div className="p-8">Loading work order details...</div>;
  }

  const status = wo.workflowState?.code || wo.status;

  const headerDetails = [
    { label: 'Production Plan', value: wo.productionPlan?.planNumber || 'N/A' },
    { label: 'Target Quantity', value: wo.quantity },
    { label: 'Created At', value: new Date(wo.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
      </Button>

      <EntityHeader 
        title={`Work Order ${wo.workOrderNumber}`}
        status={status}
        details={headerDetails}
        actions={<ActionButtons workOrderId={id} status={status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Produced Quantity</p>
                  <p className="text-2xl font-bold">
                    {wo.productionBatches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0} 
                    <span className="text-sm font-normal text-gray-500"> / {wo.quantity}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Batches Logged</p>
                  <p className="text-xl">{wo.productionBatches?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CommentPanel entityType="WORK_ORDER" entityId={id} />
            <AttachmentUploader entityType="WORK_ORDER" entityId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="WORK_ORDER" entityId={id} />
        </div>
      </div>
    </div>
  );
}

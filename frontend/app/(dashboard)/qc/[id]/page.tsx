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

export default function QCInspectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: qc, isLoading } = useQuery({
    queryKey: ['qc-inspection', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/qc/inspections/${id}`);
      return res.data;
    }
  });

  if (isLoading || !qc) {
    return <div className="p-8">Loading QC details...</div>;
  }

  const status = qc.workflowState?.code || qc.status;
  const workOrder = qc.workOrder;
  const plan = workOrder.productionPlan;
  const so = plan.salesOrder;

  const headerDetails = [
    { label: 'Work Order', value: workOrder.workOrderNumber },
    { label: 'Sales Order', value: so.orderNumber },
    { label: 'Customer', value: so.customer.companyName },
    { label: 'Target Qty', value: workOrder.quantity },
    { label: 'Produced Qty', value: workOrder.productionBatches?.reduce((sum: number, b: any) => sum + Number(b.quantity), 0) || 0 },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to QC Dashboard
      </Button>

      <EntityHeader 
        title={`QC Inspection: ${workOrder.workOrderNumber}`}
        status={status}
        details={headerDetails}
        actions={<ActionButtons qcId={id} status={status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4 text-gray-500 text-sm text-center">
                Checklist parameters will be dynamically loaded based on the product recipe.
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CommentPanel entityType="QC_INSPECTION" entityId={id} />
            <AttachmentUploader entityType="QC_INSPECTION" entityId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <WorkflowTimeline entityType="QC_INSPECTION" entityId={id} />
        </div>
      </div>
    </div>
  );
}

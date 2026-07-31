'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { ActionButtons } from '../components/ActionButtons';
import { WorkflowTimeline } from '@/components/erp/workflow/WorkflowTimeline';

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

  const status = wo.workflowState?.name || wo.status || 'Pending';
  
  // Extract info
  const workOrderRef = wo.workOrderNumber;
  // Handling case where customer could be directly in the response or nested
  const salesOrder = wo.productionPlan?.salesOrder;
  const customerName = salesOrder?.customer?.companyName || salesOrder?.customerName || 'Production Stock';
  const address = salesOrder?.customer?.address || 'Internal Warehouse';
  const gst = salesOrder?.customer?.gstNumber || 'N/A';
  const date = new Date(wo.createdAt).toLocaleDateString();

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
      </Button>

      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        padding: '36px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        border: '1px solid #eaeaea'
      }}>
        {/* Sheet Branding Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>HIMALAYA PRODUCTS</h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '600', margin: '2px 0 0 0' }}>Concrete & Aggregate Supply</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>WORK ORDER</h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '700', margin: '4px 0 0 0' }}>Ref: {workOrderRef}</p>
          </div>
        </div>

        {/* Horizontal Solid Branding Divider */}
        <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '0 0 24px 0' }} />

        {/* Client Coordinates & Order Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Assigned For:</p>
            <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{customerName}</p>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontWeight: '500', fontSize: '13px' }}>{address}</p>
            {gst !== 'N/A' && <p style={{ margin: '8px 0 0 0', color: '#1e293b', fontWeight: '700', fontSize: '12.5px' }}>GST: <span style={{ color: '#475569', fontWeight: '600' }}>{gst}</span></p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '12px', rowGap: '12px', alignItems: 'center', justifyContent: 'end' }}>
            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Date:</p>
            <p style={{ margin: 0, textAlign: 'left', fontWeight: '500', color: '#475569', fontSize: '14px' }}>{date}</p>
            
            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Plan No:</p>
            <p style={{ margin: 0, textAlign: 'left', fontWeight: '500', color: '#475569', fontSize: '14px' }}>{wo.productionPlan?.planNumber || 'N/A'}</p>

            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Status:</p>
            <div style={{ textAlign: 'left' }}><StatusBadge status={status} /></div>
          </div>
        </div>

        {/* Items Table */}
        <div className="hide-scrollbar" style={{ margin: '0 0 32px 0', border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ border: 'none', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Product Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Target Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Produced</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Product Details" style={{ padding: '16px', borderBottom: '1px solid #eaeaea' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>
                      {wo.product?.name || salesOrder?.product || 'Production Item'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '4px', fontFamily: 'monospace' }}>
                      Code: {wo.product?.code || salesOrder?.productCode || 'PRD-UNK'}
                    </div>
                  </div>
                </td>
                <td data-label="Target Qty" style={{ textAlign: 'center', fontWeight: '600', color: '#334155', padding: '16px', borderBottom: '1px solid #eaeaea' }}>
                  {wo.quantity}
                </td>
                <td data-label="Produced" style={{ textAlign: 'center', fontWeight: '600', color: '#334155', padding: '16px', borderBottom: '1px solid #eaeaea' }}>
                  {wo.productionBatches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <ActionButtons workOrderId={id} status={wo.workflowState?.code || wo.status} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #eaeaea' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '16px', letterSpacing: '0.5px' }}>
          Work Order Timeline
        </h4>
        <WorkflowTimeline entityType="WORK_ORDER" entityId={id} />
      </div>

    </div>
  );
}

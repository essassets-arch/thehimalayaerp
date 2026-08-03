'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { EntityHeader } from '@/components/erp/common/EntityHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

export function CreatePlanForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [salesOrderId, setSalesOrderId] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [productionLine, setProductionLine] = useState('');

  // Fetch Sales Orders that are SENT_TO_PLANT (or all for prototype if filtering is hard)
  const { data: salesOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['sales-orders-list'],
    queryFn: async () => {
      const res = await axios.get('/api/backend/sales/orders');
      // Ideally, we filter by status on backend: '?status=SENT_TO_PLANT'
      return res.data.data.filter((so: any) => so.workflowState?.code === 'SENT_TO_PLANT' || so.workflowState?.name === 'Sent to Plant');
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/backend/production/plans', {
        salesOrderId,
        plannedStartDate,
        plannedEndDate,
        productionLine,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Production Plan created successfully');
      queryClient.invalidateQueries({ queryKey: ['production-plans-list'] });
      router.push(`/production/plans/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(`Failed to create plan: ${err.response?.data?.message || err.message}`);
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesOrderId) {
      toast.error('Please select a Sales Order');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl px-4 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit}>
        <EntityHeader 
          title="Create Production Plan" 
          subtitle="Convert a confirmed Sales Order into a manufacturing plan."
          actions={
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Draft
              </Button>
            </div>
          }
        />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Source Sales Order (Sent To Plant)</Label>
                <Select value={salesOrderId} onValueChange={(val) => setSalesOrderId(val || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOrders ? "Loading orders..." : "Select Sales Order"} />
                  </SelectTrigger>
                  <SelectContent>
                    {salesOrders?.map((so: any) => (
                      <SelectItem key={so.id} value={so.id}>
                        {so.orderNumber} - {so.customer?.companyName}
                      </SelectItem>
                    ))}
                    {salesOrders?.length === 0 && (
                      <SelectItem value="none" disabled>No pending orders</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Planned Start Date</Label>
                  <Input type="date" value={plannedStartDate} onChange={(e) => setPlannedStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Planned End Date</Label>
                  <Input type="date" value={plannedEndDate} onChange={(e) => setPlannedEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Production Line</Label>
                <Select value={productionLine} onValueChange={(val) => setProductionLine(val || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Production Line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINE_A">Line A (Tablets & Capsules)</SelectItem>
                    <SelectItem value="LINE_B">Line B (Syrups & Liquids)</SelectItem>
                    <SelectItem value="LINE_C">Line C (Creams & Ointments)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

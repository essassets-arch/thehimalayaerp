'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { EntityHeader } from '@/components/erp/common/EntityHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Truck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export function CreateDispatchForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [salesOrderId, setSalesOrderId] = useState('');
  const [dispatchItems, setDispatchItems] = useState<{salesOrderItemId: string, quantity: number}[]>([]);

  // Fetch Sales Orders that are generally eligible. 
  // In a real system, this would explicitly look for QC Approved items in Inventory.
  // For the prototype, we fetch Sales Orders that have some items.
  const { data: salesOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['sales-orders-for-dispatch'],
    queryFn: async () => {
      const res = await axios.get('/api/backend/sales/orders');
      // For prototype, just use all confirmed or sent to plant
      return res.data.data.filter((so: any) => so.workflowState?.code !== 'DRAFT');
    }
  });

  const selectedSO = React.useMemo(() => {
    return salesOrders?.find((so: any) => so.id === salesOrderId);
  }, [salesOrders, salesOrderId]);

  React.useEffect(() => {
    if (selectedSO && selectedSO.items) {
      // Auto-populate dispatch quantities with remaining order quantities
      setDispatchItems(
        selectedSO.items.map((item: any) => ({
          salesOrderItemId: item.id,
          quantity: Number(item.orderedQuantity) // Assuming no partial dispatch tracking in prototype
        }))
      );
    } else {
      setDispatchItems([]);
    }
  }, [selectedSO]);

  const updateQuantity = (itemId: string, qty: string) => {
    setDispatchItems(prev => prev.map(item => 
      item.salesOrderItemId === itemId ? { ...item, quantity: Number(qty) || 0 } : item
    ));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/backend/logistics/dispatches', {
        salesOrderId,
        items: dispatchItems.filter(i => i.quantity > 0)
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Dispatch created successfully');
      queryClient.invalidateQueries({ queryKey: ['dispatch-list'] });
      router.push(`/dispatch/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(`Failed to create dispatch: ${err.response?.data?.message || err.message}`);
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesOrderId) {
      toast.error('Please select a Sales Order');
      return;
    }
    if (dispatchItems.filter(i => i.quantity > 0).length === 0) {
      toast.error('Must dispatch at least 1 item');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit}>
        <EntityHeader 
          title="Create Dispatch" 
          subtitle="Generate a dispatch note for finished goods."
          actions={
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                Create Dispatch
              </Button>
            </div>
          }
        />

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Source Sales Order</Label>
                <Select value={salesOrderId} onValueChange={setSalesOrderId}>
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
                      <SelectItem value="none" disabled>No orders available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedSO && (
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Ordered Qty</TableHead>
                      <TableHead>Dispatching Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSO.items?.map((item: any) => {
                      const dispatchItem = dispatchItems.find(di => di.salesOrderItemId === item.id);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productId}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.orderedQuantity}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="0"
                              max={item.orderedQuantity}
                              value={dispatchItem?.quantity || ''} 
                              onChange={(e) => updateQuantity(item.id, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}

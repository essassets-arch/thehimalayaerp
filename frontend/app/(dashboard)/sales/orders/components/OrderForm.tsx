'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { EntityHeader } from '@/components/erp/common/EntityHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { OrderItemsTable } from './OrderItemsTable';

export const itemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  orderedQuantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().min(0, 'Price must be >= 0'),
  discountAmount: z.number().min(0).optional(),
});

export const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  orderDate: z.string().optional(),
  requestedDeliveryDate: z.string().optional(),
  customerPurchaseOrderNo: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

export type FormValues = z.infer<typeof formSchema>;

export function OrderForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ productId: '', orderedQuantity: 1, unit: 'EA', unitPrice: 0 }],
      orderDate: new Date().toISOString().split('T')[0],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Calculate totals
  const items = watch('items');
  const subtotal = items.reduce((acc, item) => acc + (item.orderedQuantity * item.unitPrice), 0);
  const totalDiscount = items.reduce((acc, item) => acc + (Number(item.discountAmount) || 0), 0);
  const grandTotal = subtotal - totalDiscount;

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await axios.post('/api/backend/sales/orders', {
        ...data,
        customerId: data.customerId.includes('-') ? data.customerId : '00000000-0000-0000-0000-000000000001',
        items: data.items.map(i => ({
          ...i,
          productId: i.productId.includes('-') ? i.productId : '00000000-0000-0000-0000-000000000002',
        }))
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Sales Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['sales-orders-list'] });
      router.push(`/sales/orders/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(`Failed to create order: ${err.response?.data?.message || err.message}`);
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <EntityHeader 
          title="Create Sales Order" 
          subtitle="Enter customer and item details to generate a new order."
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

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer ID / Name</Label>
                  <Input {...register('customerId')} placeholder="Select customer..." />
                  {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Customer PO Number</Label>
                  <Input {...register('customerPurchaseOrderNo')} placeholder="PO-12345" />
                </div>
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <Input type="date" {...register('orderDate')} />
                </div>
                <div className="space-y-2">
                  <Label>Requested Delivery Date</Label>
                  <Input type="date" {...register('requestedDeliveryDate')} />
                </div>
              </CardContent>
            </Card>

            <OrderItemsTable 
              fields={fields} 
              register={register} 
              append={append} 
              remove={remove} 
              errors={errors.items} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea {...register('remarks')} placeholder="Internal or customer notes..." className="min-h-[100px]" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-red-600">-${totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="pt-4 border-t flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

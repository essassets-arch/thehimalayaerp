'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { FormValues } from './OrderForm';

interface OrderItemsTableProps {
  fields: UseFieldArrayReturn<FormValues, 'items'>['fields'];
  register: UseFormRegister<FormValues>;
  append: UseFieldArrayReturn<FormValues, 'items'>['append'];
  remove: UseFieldArrayReturn<FormValues, 'items'>['remove'];
  errors?: any;
}

export function OrderItemsTable({ fields, register, append, remove, errors }: OrderItemsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Order Items</CardTitle>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => append({ productId: '', orderedQuantity: 1, unit: 'EA', unitPrice: 0 })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-lg bg-gray-50/50">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
              <div className="sm:col-span-2 space-y-2">
                <Label>Product ID</Label>
                <Input {...register(`items.${index}.productId` as const)} placeholder="PROD-001" />
                {errors?.[index]?.productId && (
                  <p className="text-xs text-red-500">{errors[index]?.productId?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" step="0.01" {...register(`items.${index}.orderedQuantity` as const, { valueAsNumber: true })} />
                {errors?.[index]?.orderedQuantity && (
                  <p className="text-xs text-red-500">{errors[index]?.orderedQuantity?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input type="number" step="0.01" {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })} />
              </div>
            </div>
            {fields.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-red-500 self-end sm:self-auto sm:mt-8" 
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {errors?.message && <p className="text-sm text-red-500">{errors.message}</p>}
      </CardContent>
    </Card>
  );
}

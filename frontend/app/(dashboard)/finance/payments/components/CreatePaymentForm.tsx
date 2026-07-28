'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CreatePaymentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await axios.get('/api/backend/sales/customers');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/backend/finance/payments', data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['payment-list'] });
      router.push(`/finance/payments/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }
    mutation.mutate({ customerId, amount: Number(amount) });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Receive Customer Payment</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                step="0.01" 
                min="1"
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

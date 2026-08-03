'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Banknote, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActionButtonsProps {
  paymentId: string;
  status: string;
  customerId: string;
  unallocatedAmount: number;
}

export function ActionButtons({ paymentId, status, customerId, unallocatedAmount }: ActionButtonsProps) {
  const queryClient = useQueryClient();
  
  // Allocate Dialog
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [allocateAmount, setAllocateAmount] = useState<string>('');

  // Bounce Dialog
  const [bounceOpen, setBounceOpen] = useState(false);
  const [bounceRemarks, setBounceRemarks] = useState('');

  // Fetch unpaid invoices for this customer
  const { data: invoices } = useQuery({
    queryKey: ['unpaid-invoices', customerId],
    queryFn: async () => {
      const res = await axios.get('/api/backend/finance/invoices');
      // Filter out paid/cancelled ones and only this customer
      return res.data.filter((inv: any) => 
        inv.salesOrder.customerId === customerId &&
        ['POSTED', 'PARTIALLY_PAID'].includes(inv.workflowState?.code || inv.status)
      );
    },
    enabled: allocateOpen
  });

  const allocateMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/backend/finance/payments/${paymentId}/allocate`, {
        allocations: [{ invoiceId: selectedInvoice, amount: Number(allocateAmount) }]
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Payment allocated successfully`);
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['payment-list'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'CUSTOMER_PAYMENT', paymentId] });
      setAllocateOpen(false);
      setSelectedInvoice('');
      setAllocateAmount('');
    },
    onError: (err: any) => {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const bounceMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/backend/finance/payments/${paymentId}/bounce`, {
        remarks: bounceRemarks
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Payment marked as bounced`);
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['payment-list'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'CUSTOMER_PAYMENT', paymentId] });
      setBounceOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const actions = [];
  
  if (['RECEIVED', 'PARTIALLY_ALLOCATED'].includes(status) && unallocatedAmount > 0) {
    actions.push(
      <Button 
        key="allocate" 
        variant="default"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setAllocateOpen(true)}
      >
        <Banknote className="mr-2 h-4 w-4" /> Allocate Funds
      </Button>
    );
  }
  
  if (status === 'RECEIVED') {
    actions.push(
      <Button 
        key="bounce" 
        variant="destructive"
        onClick={() => setBounceOpen(true)}
      >
        <XCircle className="mr-2 h-4 w-4" /> Mark Bounced
      </Button>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        {actions}
      </div>

      {/* Allocate Dialog */}
      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Payment to Invoice</DialogTitle>
            <DialogDescription>Available to allocate: ₹{unallocatedAmount.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Invoice</Label>
              <Select value={selectedInvoice} onValueChange={(val) => setSelectedInvoice(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unpaid invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices?.length === 0 && <SelectItem value="none" disabled>No unpaid invoices</SelectItem>}
                  {invoices?.map((inv: any) => {
                    const total = inv.items?.reduce((s: number, i: any) => s + Number(i.amount), 0) || 0;
                    const paid = inv.paymentAllocations?.reduce((s: number, a: any) => s + Number(a.amount), 0) || 0;
                    const due = total - paid;
                    return (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.id.slice(0,8)} - Due: ₹{due.toFixed(2)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount to Allocate</Label>
              <Input 
                type="number"
                max={unallocatedAmount}
                value={allocateAmount}
                onChange={e => setAllocateAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => allocateMutation.mutate()} 
              disabled={allocateMutation.isPending || !selectedInvoice || !allocateAmount}
            >
              Confirm Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bounce Dialog */}
      <Dialog open={bounceOpen} onOpenChange={setBounceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Bounced</DialogTitle>
            <DialogDescription>This will reverse the payment logic and requires approval.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for bounce (e.g. Insufficient Funds)"
              value={bounceRemarks}
              onChange={(e) => setBounceRemarks(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBounceOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => bounceMutation.mutate()} disabled={bounceMutation.isPending}>
              Confirm Bounced
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

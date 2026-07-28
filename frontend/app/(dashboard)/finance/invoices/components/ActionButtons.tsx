'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Send, FileX, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ActionButtonsProps {
  invoiceId: string;
  status: string;
}

export function ActionButtons({ invoiceId, status }: ActionButtonsProps) {
  const queryClient = useQueryClient();
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    action: string;
    endpoint: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    action: '',
    endpoint: '',
    title: '',
    description: ''
  });
  
  const [remarks, setRemarks] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/backend${dialogConfig.endpoint}`, {
        remarks: remarks.trim() || undefined
      });
      return res.data;
    },
    onSuccess: () => {
      const actionName = dialogConfig.action.toLowerCase().replace(/_/g, ' ');
      toast.success(`Invoice ${actionName} successfully`);
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'INVOICE', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
      setDialogConfig({ ...dialogConfig, isOpen: false });
      setRemarks('');
    },
    onError: (err: any) => {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const actions = [];
  
  if (status === 'DRAFT') {
    actions.push(
      <Button 
        key="post" 
        variant="default"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'POST',
          endpoint: `/finance/invoices/${invoiceId}/post`,
          title: 'Post Invoice',
          description: 'This will lock the invoice and update the customer ledger.'
        })}
      >
        <Send className="mr-2 h-4 w-4" /> Post Invoice
      </Button>
    );
    actions.push(
      <Button 
        key="cancel" 
        variant="outline"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'CANCEL',
          endpoint: `/finance/invoices/${invoiceId}/cancel`,
          title: 'Cancel Invoice',
          description: 'Cancel this draft invoice.'
        })}
      >
        <XCircle className="mr-2 h-4 w-4" /> Cancel
      </Button>
    );
  } else if (status === 'POSTED') {
    actions.push(
      <Button 
        key="void" 
        variant="destructive"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'VOID',
          endpoint: `/finance/invoices/${invoiceId}/void`,
          title: 'Void Invoice',
          description: 'Are you sure you want to void this posted invoice? This will require approval and reverse ledger entries.'
        })}
      >
        <FileX className="mr-2 h-4 w-4" /> Void
      </Button>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        {actions}
      </div>

      <Dialog open={dialogConfig.isOpen} onOpenChange={(open) => setDialogConfig(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogConfig.title}</DialogTitle>
            <DialogDescription>{dialogConfig.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

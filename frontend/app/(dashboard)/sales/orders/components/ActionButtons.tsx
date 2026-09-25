'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle, XCircle, FileText, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { isPureTradingOrder } from '@/shared/utils/dispatchCategory';

interface ActionButtonsProps {
  orderId: string;
  status: string;
  order?: any;
}

export function ActionButtons({ orderId, status }: ActionButtonsProps) {
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
        remarks: remarks.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      const actionName = dialogConfig.action.toLowerCase().replace(/_/g, ' ');
      toast.success(`Sales Order ${actionName} successfully`);
      queryClient.invalidateQueries({ queryKey: ['sales-orders', orderId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'SALES_ORDER', orderId] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders-list'] });
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
      <Button key="edit" variant="outline">
        <Edit className="mr-2 h-4 w-4" /> Edit
      </Button>
    );
    actions.push(
      <Button 
        key="submit" 
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'SUBMIT',
          endpoint: `/sales/orders/${orderId}/submit`,
          title: 'Submit Order',
          description: 'Are you sure you want to submit this order for approval?'
        })}
      >
        <Send className="mr-2 h-4 w-4" /> Submit Order
      </Button>
    );
  } else if (status === 'PENDING_APPROVAL') {
    actions.push(
      <Button 
        key="approve"
        variant="default"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'APPROVE',
          endpoint: `/sales/orders/${orderId}/approve`,
          title: 'Approve Order',
          description: 'Are you sure you want to approve this order?'
        })}
      >
        <CheckCircle className="mr-2 h-4 w-4" /> Approve
      </Button>
    );
    actions.push(
      <Button 
        key="reject"
        variant="destructive"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'REJECT',
          endpoint: `/sales/orders/${orderId}/reject`,
          title: 'Reject Order',
          description: 'Please provide a reason for rejecting this order.'
        })}
      >
        <XCircle className="mr-2 h-4 w-4" /> Reject
      </Button>
    );
  } else if (status === 'APPROVED' || status === 'CONFIRMED' || status === 'ORDER_CONFIRMED') {
    const isTrading = order ? isPureTradingOrder(order) : false;
    actions.push(
      <Button 
        key="send"
        variant="default"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: isTrading ? 'SEND_TO_DISPATCH_2' : 'SEND_TO_PLANT',
          endpoint: `/sales/orders/${orderId}/send-to-plant`,
          title: isTrading ? 'Send to Dispatch 2' : 'Send to Plant',
          description: isTrading
            ? 'This is a Trading Order. It will bypass factory production and route directly to Dispatch 2 (Sahad Dispatch).'
            : 'Are you sure you want to send this order to the plant for production?'
        })}
      >
        <FileText className="mr-2 h-4 w-4" /> {isTrading ? 'Send to Dispatch 2' : 'Send to Plant'}
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
              variant={dialogConfig.action === 'REJECT' ? 'destructive' : 'default'}
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

'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PackageSearch, PackageCheck, Play, PlusSquare, CheckSquare } from 'lucide-react';
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
  workOrderId: string;
  status: string;
}

export function ActionButtons({ workOrderId, status }: ActionButtonsProps) {
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
      toast.success(`Work Order ${actionName} successfully`);
      queryClient.invalidateQueries({ queryKey: ['work-orders', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'WORK_ORDER', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-orders-list'] });
      setDialogConfig({ ...dialogConfig, isOpen: false });
      setRemarks('');
    },
    onError: (err: any) => {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const actions = [];
  
  if (status === 'CREATED') {
    actions.push(
      <Button 
        key="request" 
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'REQUEST_MATERIALS',
          endpoint: `/production/work-orders/${workOrderId}/request-materials`,
          title: 'Request Materials',
          description: 'Request raw materials from the store for this work order.'
        })}
      >
        <PackageSearch className="mr-2 h-4 w-4" /> Request Materials
      </Button>
    );
  } else if (status === 'MATERIAL_PENDING') {
    actions.push(
      <Button 
        key="issue"
        variant="default"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'ISSUE_MATERIALS',
          endpoint: `/production/work-orders/${workOrderId}/issue-materials`,
          title: 'Issue Materials',
          description: 'Mark materials as issued from the store to the shop floor.'
        })}
      >
        <PackageCheck className="mr-2 h-4 w-4" /> Issue Materials
      </Button>
    );
  } else if (status === 'READY') {
    actions.push(
      <Button 
        key="start"
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'START',
          endpoint: `/production/work-orders/${workOrderId}/start`,
          title: 'Start Work Order',
          description: 'Begin production for this work order.'
        })}
      >
        <Play className="mr-2 h-4 w-4" /> Start Production
      </Button>
    );
  } else if (status === 'STARTED' || status === 'PARTIALLY_COMPLETED') {
    actions.push(
      <Button 
        key="log"
        variant="outline"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'LOG_BATCH',
          endpoint: `/production/work-orders/${workOrderId}/log-batch`,
          title: 'Log Batch',
          description: 'Log a partially completed batch for this work order.'
        })}
      >
        <PlusSquare className="mr-2 h-4 w-4" /> Log Batch
      </Button>
    );
    actions.push(
      <Button 
        key="complete"
        variant="default"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'COMPLETE',
          endpoint: `/production/work-orders/${workOrderId}/complete`,
          title: 'Complete Work Order',
          description: 'Mark this work order as completely finished.'
        })}
      >
        <CheckSquare className="mr-2 h-4 w-4" /> Complete Work Order
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

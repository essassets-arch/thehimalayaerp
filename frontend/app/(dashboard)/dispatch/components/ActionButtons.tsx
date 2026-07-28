'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckSquare, CheckCircle } from 'lucide-react';
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
  dispatchId: string;
  status: string;
}

export function ActionButtons({ dispatchId, status }: ActionButtonsProps) {
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
        partial: dialogConfig.action === 'PARTIAL_DELIVERY'
      });
      return res.data;
    },
    onSuccess: () => {
      const actionName = dialogConfig.action.toLowerCase().replace(/_/g, ' ');
      toast.success(`Dispatch ${actionName} successfully`);
      queryClient.invalidateQueries({ queryKey: ['dispatch', dispatchId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'DISPATCH', dispatchId] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-list'] });
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
        key="ready" 
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'READY_FOR_DISPATCH',
          endpoint: `/logistics/dispatches/${dispatchId}/mark-ready`,
          title: 'Mark as Ready',
          description: 'Confirm that all items are picked and packed.'
        })}
      >
        <Package className="mr-2 h-4 w-4" /> Mark Ready
      </Button>
    );
  } else if (status === 'READY') {
    actions.push(
      <Button 
        key="dispatch"
        variant="default"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'DISPATCH',
          endpoint: `/logistics/dispatches/${dispatchId}/dispatch`,
          title: 'Dispatch Vehicle',
          description: 'Confirm that the vehicle has left the facility.'
        })}
      >
        <Truck className="mr-2 h-4 w-4" /> Dispatch
      </Button>
    );
  } else if (status === 'IN_TRANSIT' || status === 'PARTIALLY_DELIVERED') {
    actions.push(
      <Button 
        key="partial"
        variant="outline"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'PARTIAL_DELIVERY',
          endpoint: `/logistics/dispatches/${dispatchId}/deliver`,
          title: 'Log Partial Delivery',
          description: 'Log a partial delivery at a waypoint or customer site.'
        })}
      >
        <CheckSquare className="mr-2 h-4 w-4" /> Partial Delivery
      </Button>
    );
    actions.push(
      <Button 
        key="deliver"
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'DELIVER',
          endpoint: `/logistics/dispatches/${dispatchId}/deliver`,
          title: 'Confirm Full Delivery',
          description: 'Confirm POD received and items fully delivered.'
        })}
      >
        <CheckCircle className="mr-2 h-4 w-4" /> Confirm Delivery
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
              placeholder="Remarks (Optional, e.g., LR number, Vehicle info, POD notes)"
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

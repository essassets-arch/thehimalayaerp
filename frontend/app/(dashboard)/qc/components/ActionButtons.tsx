'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
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
  qcId: string;
  status: string;
}

export function ActionButtons({ qcId, status }: ActionButtonsProps) {
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
      toast.success(`QC Inspection ${actionName} successfully`);
      queryClient.invalidateQueries({ queryKey: ['qc-inspection', qcId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'QC_INSPECTION', qcId] });
      queryClient.invalidateQueries({ queryKey: ['qc-list'] });
      setDialogConfig({ ...dialogConfig, isOpen: false });
      setRemarks('');
    },
    onError: (err: any) => {
      toast.error(`Failed: ${err.response?.data?.message || err.message}`);
    }
  });

  const actions = [];
  
  if (status === 'PENDING') {
    actions.push(
      <Button 
        key="start" 
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'START',
          endpoint: `/qc/inspections/${qcId}/start`,
          title: 'Start Inspection',
          description: 'Begin the quality control inspection for this batch.'
        })}
      >
        <Play className="mr-2 h-4 w-4" /> Start Inspection
      </Button>
    );
  } else if (status === 'IN_PROGRESS') {
    actions.push(
      <Button 
        key="approve"
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'APPROVE',
          endpoint: `/qc/inspections/${qcId}/approve`,
          title: 'Approve Inspection',
          description: 'Mark this batch as QC Passed. It will be available for dispatch.'
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
          endpoint: `/qc/inspections/${qcId}/reject`,
          title: 'Reject Batch',
          description: 'Mark this batch as rejected (Unusable). Please provide reasons.'
        })}
      >
        <XCircle className="mr-2 h-4 w-4" /> Reject
      </Button>
    );
    actions.push(
      <Button 
        key="rework"
        variant="outline"
        className="text-orange-600 border-orange-600 hover:bg-orange-50"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'REWORK',
          endpoint: `/qc/inspections/${qcId}/rework`,
          title: 'Send for Rework',
          description: 'Return this batch to the production floor for rework.'
        })}
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Send to Rework
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
              placeholder="Remarks (Mandatory for Reject/Rework)"
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
              disabled={mutation.isPending || ((dialogConfig.action === 'REJECT' || dialogConfig.action === 'REWORK') && remarks.trim() === '')}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

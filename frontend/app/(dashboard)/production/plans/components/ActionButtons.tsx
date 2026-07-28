'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle, XCircle, Settings, Play } from 'lucide-react';
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
  planId: string;
  status: string;
}

export function ActionButtons({ planId, status }: ActionButtonsProps) {
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
      toast.success(`Production Plan ${actionName} successfully`);
      queryClient.invalidateQueries({ queryKey: ['production-plans', planId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', 'PRODUCTION_PLAN', planId] });
      queryClient.invalidateQueries({ queryKey: ['production-plans-list'] });
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
        key="submit" 
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'SUBMIT',
          endpoint: `/production/plans/${planId}/submit`,
          title: 'Submit Plan',
          description: 'Are you sure you want to submit this plan for review?'
        })}
      >
        <Send className="mr-2 h-4 w-4" /> Submit for Review
      </Button>
    );
  } else if (status === 'UNDER_REVIEW') {
    actions.push(
      <Button 
        key="approve"
        variant="default"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'APPROVE',
          endpoint: `/production/plans/${planId}/approve`,
          title: 'Approve Plan',
          description: 'Are you sure you want to approve this production plan?'
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
          endpoint: `/production/plans/${planId}/reject`,
          title: 'Reject Plan',
          description: 'Please provide a reason for rejecting this plan.'
        })}
      >
        <XCircle className="mr-2 h-4 w-4" /> Reject
      </Button>
    );
  } else if (status === 'APPROVED') {
    actions.push(
      <Button 
        key="release"
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setDialogConfig({
          isOpen: true,
          action: 'RELEASE',
          endpoint: `/production/plans/${planId}/release`,
          title: 'Release to Floor',
          description: 'Are you sure you want to release this plan to the shop floor?'
        })}
      >
        <Play className="mr-2 h-4 w-4" /> Release to Floor
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

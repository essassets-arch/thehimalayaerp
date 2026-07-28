'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface WorkflowActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  action: string;
  apiUrl: string; // E.g. /sales/orders/:id/action
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function WorkflowActionDialog({
  isOpen,
  onOpenChange,
  entityType,
  entityId,
  action,
  apiUrl,
  title,
  description,
  onSuccess
}: WorkflowActionDialogProps) {
  const [remarks, setRemarks] = useState('');
  const queryClient = useQueryClient();

  const formattedActionName = action.replace(/_/g, ' ');
  const dialogTitle = title || `Confirm ${formattedActionName}`;
  const dialogDesc = description || `Are you sure you want to perform the action: ${formattedActionName}?`;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/backend${apiUrl}`, {
        action,
        remarks: remarks.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${formattedActionName} successful`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: [`${entityType}-list`] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', entityType, entityId] });
      
      setRemarks('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'An error occurred';
      toast.error(`Action failed: ${msg}`);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDesc}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="remarks" className="text-sm font-medium text-gray-700">
              Remarks (Optional)
            </label>
            <Textarea
              id="remarks"
              placeholder="Add any comments or reasoning for this action..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending}
            className="min-w-[100px]"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

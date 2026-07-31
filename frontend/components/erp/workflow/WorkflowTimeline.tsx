'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '../common/StatusBadge';
import { cn } from '@/lib/utils';

interface WorkflowHistoryItem {
  id: string;
  fromStatus: string;
  toStatus: string;
  actionName: string | null;
  remarks: string | null;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface WorkflowTimelineProps {
  entityType: string;
  entityId: string;
  className?: string;
}

export function WorkflowTimeline({ entityType, entityId, className }: WorkflowTimelineProps) {
  const { data: history = [], isLoading, isError } = useQuery({
    queryKey: ['workflow-history', entityType, entityId],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/workflow/history/${entityType}/${entityId}`);
      // If the backend wraps the response in { success, data, meta }, unpack it here.
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  if (isLoading) return <Card className={className}><CardContent className="p-6 text-center text-sm text-gray-500">Loading timeline...</CardContent></Card>;
  if (isError) return <Card className={className}><CardContent className="p-6 text-center text-sm text-red-500">Failed to load timeline.</CardContent></Card>;

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-sm text-gray-500">
          No workflow history available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Workflow History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
          {history.map((item, index) => {
            const isLast = index === history.length - 1;
            return (
              <div key={item.id} className="relative">
                <span className="absolute -left-[35px] bg-white p-1 rounded-full">
                  {isLast ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </span>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.actionName || 'System Action'}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:inline-block">
                        by {item.user?.name || 'System'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {item.fromStatus ? <StatusBadge status={item.fromStatus} className="text-[10px] px-2 py-0" /> : <span className="text-xs text-gray-500">Start</span>}
                    <span className="text-gray-400 text-xs">→</span>
                    <StatusBadge status={item.toStatus} className="text-[10px] px-2 py-0" />
                  </div>

                  {item.remarks && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 italic">
                      "{item.remarks}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

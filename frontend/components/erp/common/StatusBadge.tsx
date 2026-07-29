import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'SENT_TO_PLANT'
  | 'DELIVERED'
  | 'PARTIALLY_DELIVERED'
  | string;

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
      case 'DISPATCH_DRAFT':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 border border-gray-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border border-amber-200';
      case 'APPROVED':
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'DELIVERED':
      case 'DISPATCH_APPROVED':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80 border border-red-200';
      case 'IN_PROGRESS':
      case 'SENT_TO_PLANT':
      case 'PARTIALLY_DELIVERED':
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border border-blue-200';
      case 'READY_FOR_PICKUP':
        return 'bg-violet-100 text-violet-800 hover:bg-violet-100/80 border border-violet-200';
      case 'VEHICLE_ASSIGNED':
        return 'bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100/80 border border-fuchsia-200';
      case 'LOADING_IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100/80 border border-orange-200';
      case 'DISPATCHED':
        return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80 border border-cyan-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 border border-indigo-200';
      case 'POD_RECEIVED':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-100/80 border border-teal-200';
      case 'DISPATCH_CLOSED':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100/80 border border-slate-200';
      default:
        return 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <Badge className={cn('font-medium px-2.5 py-0.5 rounded-full border-none', getBadgeVariant(status), className)}>
      {formatStatus(status)}
    </Badge>
  );
}

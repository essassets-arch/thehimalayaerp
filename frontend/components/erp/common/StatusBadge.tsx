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
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80';
      case 'APPROVED':
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      case 'IN_PROGRESS':
      case 'SENT_TO_PLANT':
      case 'PARTIALLY_DELIVERED':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
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

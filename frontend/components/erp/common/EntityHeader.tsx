import React from 'react';
import { StatusBadge, StatusVariant } from './StatusBadge';

interface EntityHeaderProps {
  title: string;
  subtitle?: string;
  status?: StatusVariant;
  actions?: React.ReactNode;
  details?: any[];
}

export function EntityHeader({ title, subtitle, status, actions }: EntityHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
          {status && <StatusBadge status={status} />}
        </div>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

import React from 'react';

export function PageHeader({ title, description, actions }: { title: string, description?: string, actions?: React.ReactNode }) {
  return (
    <div className="shared-page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div className="shared-page-header-copy">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="shared-page-header-actions flex w-full items-center gap-3 md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

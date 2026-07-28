import React from 'react';
import { cn } from '@/lib/utils';

export function PageContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6 p-6 md:p-8 bg-slate-50 min-h-screen", className)}>
      {children}
    </div>
  );
}

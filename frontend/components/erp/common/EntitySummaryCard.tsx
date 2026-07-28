import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SummaryItem {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface EntitySummaryCardProps {
  title: string;
  items: SummaryItem[];
  className?: string;
}

export function EntitySummaryCard({ title, items, className }: EntitySummaryCardProps) {
  return (
    <Card className={cn("overflow-hidden shadow-sm", className)}>
      <CardHeader className="bg-gray-50/50 py-3 border-b">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <dl className="grid grid-cols-1 divide-y">
          {items.map((item, index) => (
            <div key={index} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
              <dd className={cn("mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium", item.className)}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

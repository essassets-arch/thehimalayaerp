import React from 'react';
import { Card, CardContent } from './card';

export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue 
}: { 
  title: string, 
  value: string | number, 
  description?: string, 
  icon?: React.ReactNode, 
  trend?: 'up' | 'down' | 'neutral', 
  trendValue?: string 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-white border-slate-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          {icon && (
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              {icon}
            </div>
          )}
        </div>
        {(description || trendValue) && (
          <div className="mt-4 flex items-center text-sm">
            {trend === 'up' && <span className="text-emerald-600 font-medium mr-2">↑ {trendValue}</span>}
            {trend === 'down' && <span className="text-rose-600 font-medium mr-2">↓ {trendValue}</span>}
            <span className="text-slate-500">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export function PayrollBatchSummary({ batch }: { batch: any }) {
  if (!batch) return null;

  return (
    <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
              Payroll Batch: {batch.month}
              <Badge variant="outline" className="text-indigo-600 bg-white ml-2">{batch.status}</Badge>
            </h2>
            <p className="text-sm text-indigo-700/70 mt-1">Batch ID: {batch.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-indigo-900/60 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-indigo-950">{batch.totalEmployees || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900/60 mb-1">Gross Salary</p>
            <p className="text-2xl font-bold text-indigo-950">₹{(batch.totalGross || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900/60 mb-1">Total Deductions</p>
            <p className="text-2xl font-bold text-rose-600">₹{(batch.totalDeductions || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900/60 mb-1">Net Payable</p>
            <p className="text-2xl font-bold text-emerald-600">₹{(batch.totalNet || 0).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

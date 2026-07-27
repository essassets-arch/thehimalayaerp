import React from 'react';
import { StatCard } from '../ui/stat-card';

interface PayrollSummaryStatsProps {
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  paidAmount?: number;
  remainingAmount?: number;
}

export function PayrollSummaryStats({ 
  totalEmployees, 
  totalGross, 
  totalDeductions, 
  totalNet,
  paidAmount,
  remainingAmount
}: PayrollSummaryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Employees" 
        value={totalEmployees.toString()} 
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
      />
      <StatCard 
        title="Gross Salary" 
        value={`₹${totalGross.toLocaleString()}`} 
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <StatCard 
        title="Total Deductions" 
        value={`₹${totalDeductions.toLocaleString()}`} 
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <StatCard 
        title="Net Payable" 
        value={`₹${totalNet.toLocaleString()}`} 
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
      />
      {paidAmount !== undefined && (
        <StatCard 
          title="Total Paid" 
          value={`₹${paidAmount.toLocaleString()}`} 
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      )}
      {remainingAmount !== undefined && (
        <StatCard 
          title="Remaining to Pay" 
          value={`₹${remainingAmount.toLocaleString()}`} 
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      )}
    </div>
  );
}

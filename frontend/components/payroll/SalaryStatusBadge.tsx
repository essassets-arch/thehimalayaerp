import React from 'react';
import { Badge } from '../ui/badge';

export function SalaryStatusBadge({ status }: { status: string }) {
  let bgClass = "bg-slate-100";
  let textClass = "text-slate-600";
  let borderClass = "border-slate-200";
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'DRAFT':
    case 'CORRECTION_REQUIRED':
      bgClass = "bg-slate-100"; textClass = "text-slate-600"; borderClass = "border-slate-200";
      break;
    case 'PENDING_SUPER_ADMIN_APPROVAL':
      bgClass = "bg-[#fef9c3]"; textClass = "text-[#854d0e]"; borderClass = "border-[#fde047]"; // Pale yellow
      label = 'PENDING SUPER ADMIN APPROVAL';
      break;
    case 'SUPER_ADMIN_APPROVED':
    case 'SALARY_PAID':
      bgClass = "bg-[#dcfce7]"; textClass = "text-[#166534]"; borderClass = "border-[#86efac]"; // Green
      label = status === 'SALARY_PAID' ? 'PAID' : 'APPROVED';
      break;
    case 'SUPER_ADMIN_REJECTED':
      bgClass = "bg-[#fee2e2]"; textClass = "text-[#991b1b]"; borderClass = "border-[#fca5a5]"; // Red
      label = 'REJECTED';
      break;
    case 'SUPER_ADMIN_ON_HOLD':
      bgClass = "bg-[#ffedd5]"; textClass = "text-[#9a3412]"; borderClass = "border-[#fdba74]"; // Orange/warning
      label = 'ON HOLD';
      break;
    case 'SENT_TO_FINANCE':
    case 'PAYMENT_PROCESSING':
      bgClass = "bg-[#dbeafe]"; textClass = "text-[#1e3a8a]"; borderClass = "border-[#93c5fd]"; // Blue (Active/Trial equivalents)
      label = status === 'SENT_TO_FINANCE' ? 'SENT TO FINANCE' : 'PAYMENT PROCESSING';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${bgClass} ${textClass} ${borderClass}`}>
      {label}
    </span>
  );
}

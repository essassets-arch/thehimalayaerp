import React from 'react';
import { Modal } from '../ui/modal';
import { SalaryTimeline } from './SalaryTimeline';
import { SalaryStatusBadge } from './SalaryStatusBadge';

interface SalaryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  salary: any;
  footerActions?: React.ReactNode;
}

export function SalaryDetailsModal({ isOpen, onClose, salary, footerActions }: SalaryDetailsModalProps) {
  if (!salary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Salary Details" size="xl" footer={footerActions}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{salary.employeeName}</h3>
            <p className="text-sm text-slate-500">{salary.designation} • {salary.department}</p>
            <p className="text-sm text-slate-500 mt-1">ID: {salary.employeeId}</p>
          </div>
          <div className="text-left sm:text-right">
            <SalaryStatusBadge status={salary.status} />
            <p className="text-xs text-slate-400 mt-2">Month: {salary.month}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Attendance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Working Days</span><span className="font-medium">{salary.workingDays}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Present</span><span className="font-medium text-emerald-600">{salary.presentDays}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Absent</span><span className="font-medium text-rose-600">{salary.absentDays}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid Leave</span><span className="font-medium">{salary.paidLeave}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">OT Hours</span><span className="font-medium">{salary.overtimeHours}</span></div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Earnings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Basic Salary</span><span className="font-medium">₹{salary.basicSalary?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">HRA</span><span className="font-medium">₹{salary.hra?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Allowances</span><span className="font-medium">₹{salary.allowances?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">OT Amount</span><span className="font-medium">₹{salary.overtimeAmount?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bonus</span><span className="font-medium">₹{salary.bonus?.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t font-semibold text-slate-900"><span className="text-slate-900">Gross Salary</span><span>₹{salary.grossSalary?.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Deductions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">PF</span><span className="font-medium text-rose-600">₹{salary.pf?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">ESI</span><span className="font-medium text-rose-600">₹{salary.esi?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Prof. Tax</span><span className="font-medium text-rose-600">₹{salary.professionalTax?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TDS</span><span className="font-medium text-rose-600">₹{salary.tds?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Loans/Other</span><span className="font-medium text-rose-600">₹{((salary.loanRecovery || 0) + (salary.leaveDeduction || 0) + (salary.otherDeduction || 0)).toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t font-semibold text-rose-700"><span>Total Deductions</span><span>₹{salary.totalDeductions?.toLocaleString()}</span></div>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-6 flex flex-col justify-center items-center border border-emerald-100">
            <span className="text-sm font-medium text-emerald-800 uppercase tracking-wider mb-2">Net Payable</span>
            <span className="text-4xl font-bold text-emerald-600">₹{salary.netSalary?.toLocaleString()}</span>
          </div>
        </div>

        {salary.paymentStatus && salary.paymentStatus !== 'NOT_SENT' && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Payment Details</h4>
            <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block">Payment Date</span><span className="font-medium">{salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString() : 'N/A'}</span></div>
              <div><span className="text-slate-500 block">Payment Mode</span><span className="font-medium">{salary.paymentMode || 'N/A'}</span></div>
              <div><span className="text-slate-500 block">Transaction Ref (UTR)</span><span className="font-medium">{salary.transactionReference || 'N/A'}</span></div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Audit Timeline</h4>
          <SalaryTimeline history={salary.history} />
        </div>
      </div>
    </Modal>
  );
}

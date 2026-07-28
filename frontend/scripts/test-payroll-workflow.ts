import { useERPStore } from '../store/erpStore';
import {
  approvePayrollBySuperAdmin,
  closePayroll,
  createPayrollDraft,
  createSalaryPaymentBatch,
  generatePayslips,
  markEmployeePaymentPaid,
  selectPayrollRuns,
  submitPayrollToSuperAdmin,
  verifyPayrollByFinance,
} from '../store/payrollFlow';

const store = useERPStore.getState();
store.setState({
  ...store.state,
  payrollRuns: [],
  employees: [
    { id: 'EMP-HARSH-001', name: 'Harsh Prajapati', department: 'Production', status: 'ACTIVE', baseSalary: 30000, allowance: 10000, pf: 4000, bankAccount: '111', ifscCode: 'TEST0001' },
    { id: 'EMP-HARSH-002', name: 'Test Employee', department: 'Store', status: 'ACTIVE', baseSalary: 25000, allowance: 5000, pf: 3000, bankAccount: '222', ifscCode: 'TEST0002' },
  ],
});

const id = createPayrollDraft('2026-07', { payrollId: 'PAY-HARSH-2026-07' });
let run = selectPayrollRuns(useERPStore.getState().state)[0];
if (run.totals.netPayable !== 63000) throw new Error(`Expected ₹63,000, received ₹${run.totals.netPayable}.`);

submitPayrollToSuperAdmin(id);
approvePayrollBySuperAdmin(id, 'Checked');
verifyPayrollByFinance(id);
createSalaryPaymentBatch(id);
markEmployeePaymentPaid(id, 'EMP-HARSH-001', { transactionReference: 'TXN-HARSH-001' });

run = selectPayrollRuns(useERPStore.getState().state)[0];
if (run.status !== 'PARTIALLY_PAID') throw new Error(`Expected PARTIALLY_PAID, received ${run.status}.`);

markEmployeePaymentPaid(id, 'EMP-HARSH-002', { transactionReference: 'TXN-HARSH-002' });
generatePayslips(id);
closePayroll(id);

run = selectPayrollRuns(useERPStore.getState().state)[0];
if (run.status !== 'PAYROLL_CLOSED') throw new Error(`Expected PAYROLL_CLOSED, received ${run.status}.`);
console.log(`PASS ${run.id}: ₹${run.totals.netPayable}, ${run.status}`);

import { expect, test } from '@playwright/test';

const payrollId = 'PAY-HARSH-2026-07';

test.describe.serial('Final salary workflow', () => {
  test('HR → Super Admin → Finance → Payslip → Closure', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/hr/salary/prepare');
    await page.waitForFunction(() => {
      try {
        return JSON.parse(localStorage.getItem('erp_employees') || '[]').length >= 10;
      } catch {
        return false;
      }
    });
    await page.evaluate(() => {
      localStorage.setItem('erp_payroll_runs', '[]');
      localStorage.setItem('erp_employees', JSON.stringify([
        { id: 'EMP-HARSH-001', name: 'Harsh Prajapati', department: 'Production', designation: 'Operator', status: 'ACTIVE', baseSalary: 30000, allowance: 10000, pf: 4000, bankAccount: '111111', ifscCode: 'TEST0001' },
        { id: 'EMP-HARSH-002', name: 'Test Employee', department: 'Store', designation: 'Store Assistant', status: 'ACTIVE', baseSalary: 25000, allowance: 5000, pf: 3000, bankAccount: '222222', ifscCode: 'TEST0002' },
      ]));
    });
    await page.getByLabel('Salary Month').fill('2026-07');
    await page.getByLabel('Payroll ID').fill(payrollId);
    await page.getByRole('button', { name: 'Generate Payroll' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText(payrollId)).toBeVisible();
    await expect(page.getByText('PAYROLL_DRAFT')).toBeVisible();
    await expect(page.getByLabel('Payroll summary').getByText('₹63,000')).toBeVisible();
    const savedAfterCreate = await page.evaluate(() => JSON.parse(localStorage.getItem('erp_payroll_runs') || '[]'));
    console.log('Payroll storage after create:', savedAfterCreate.map((run: { id: string }) => run.id));
    expect(savedAfterCreate.filter((run: { id: string }) => run.id === payrollId)).toHaveLength(1);

    await page.reload();
    await expect(page.getByText(payrollId)).toBeVisible();
    await page.getByRole('button', { name: 'Generate Payroll' }).click();
    await expect(page.getByText('Payroll already exists for this month and branch.')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    await page.getByRole('button', { name: 'Submit to Super Admin' }).click();
    await page.getByRole('button', { name: 'Submit to Super Admin' }).last().click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('PENDING_SUPER_ADMIN_APPROVAL')).toBeVisible();
    await page.getByRole('button', { name: 'View / Review' }).click();
    await expect(page.getByText('Payroll is pending Super Admin approval and cannot be edited.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Deduction' }).first()).toBeDisabled();

    await page.goto('/finance/salary-verification');
    await expect(page.getByText(payrollId)).toHaveCount(0);

    await page.goto('/super-admin/salary-approvals');
    await expect(page.getByText(payrollId)).toBeVisible();
    await page.getByRole('button', { name: 'Reject', exact: true }).click();
    await page.locator('.swal2-textarea').fill('Incorrect deduction for EMP-HARSH-001.');
    await page.getByRole('button', { name: 'Reject', exact: true }).last().click();
    await expect(page.getByText('SUPER_ADMIN_REJECTED')).toBeVisible();

    await page.goto('/finance/salary-verification');
    await expect(page.getByText(payrollId)).toHaveCount(0);
    await page.goto('/hr/salary/prepare?tab=Rejected');
    await expect(page.getByText('SUPER_ADMIN_REJECTED')).toBeVisible();
    await page.getByRole('button', { name: 'Correct Payroll' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'View / Review' }).click();
    await page.getByRole('button', { name: 'Edit Deduction' }).first().click();
    await page.locator('.swal2-input').fill('0');
    await page.getByRole('button', { name: 'Save correction' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Submit to Super Admin' }).click();
    await page.getByRole('button', { name: 'Submit to Super Admin' }).last().click();
    await page.getByRole('button', { name: 'OK' }).click();

    await page.goto('/super-admin/salary-approvals');
    await page.getByRole('button', { name: 'Approve and Send to Finance' }).click();
    await page.locator('.swal2-textarea').fill('Payroll totals verified.');
    await page.getByRole('button', { name: 'Approve and Send to Finance' }).last().click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('SUPER_ADMIN_APPROVED')).toBeVisible();

    await page.goto('/finance/salary-verification');
    await expect(page.getByText(payrollId)).toBeVisible();
    await page.getByRole('button', { name: 'Verify Payroll' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.goto('/finance/salary-disbursement');
    await expect(page.getByText('FINANCE_VERIFIED')).toBeVisible();
    await page.getByRole('button', { name: 'Generate Payment Batch' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('PAYMENT_PROCESSING').first()).toBeVisible();

    await page.getByRole('button', { name: 'View / Review' }).click();
    await page.getByRole('button', { name: 'Mark Paid' }).first().click();
    await page.getByRole('button', { name: 'Mark Failed' }).click();
    await expect(page.getByText('PARTIALLY_PAID')).toBeVisible();

    await page.getByRole('button', { name: 'Failed' }).click();
    await expect(page.getByRole('cell', { name: 'PAYMENT_FAILED', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'PAYMENT_PAID', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Retry Payment' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Mark Paid' }).click();
    await expect(page.getByText('SALARY_PAID')).toBeVisible();

    await page.goto('/hr/salary/payslips');
    await page.getByRole('button', { name: 'Generate Payslips' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('PAYSLIP_GENERATED')).toBeVisible();
    await page.reload();
    await expect(page.getByText('PAYSLIP_GENERATED')).toBeVisible();

    await page.goto('/hr/salary/history');
    await page.getByRole('button', { name: 'Close Payroll' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('PAYROLL_CLOSED')).toBeVisible();
    await page.reload();
    await expect(page.getByText('PAYROLL_CLOSED')).toBeVisible();

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('erp_payroll_runs') || '[]'));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(payrollId);
    expect(stored[0].revisionHistory.some((entry: { action: string }) => entry.action === 'SUPER_ADMIN_REJECTED')).toBeTruthy();
    expect(stored[0].employees.every((employee: { paymentStatus: string }) => employee.paymentStatus === 'PAYMENT_PAID')).toBeTruthy();
  });
});

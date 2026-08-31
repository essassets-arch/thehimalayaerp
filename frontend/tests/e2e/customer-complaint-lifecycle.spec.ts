import { expect, test, type Page } from '@playwright/test';

async function getAuthToken(email: string, pass: string): Promise<string> {
  try {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const json = await res.json();
    return json.data?.accessToken || '';
  } catch {
    return '';
  }
}

async function loginAs(page: Page, email: string) {
  const isPlantHead = email.includes('sana');
  const roleName = isPlantHead ? 'Plant Head' : 'SuperSales';
  const userName = isPlantHead ? 'Sana R' : 'SuperSales One';
  const userId = isPlantHead ? '3b3c4d40-94ec-4824-933c-260ebb2660e8' : '7c3a3b46-e26c-4404-96e9-63b83b86c460';
  const password = isPlantHead ? 'Himalaya@1234' : 'supersales123';
  const token = await getAuthToken(email, password);

  await page.addInitScript(({ roleName, userName, userId, token, email }) => {
    (window as any).__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('token', token);
    localStorage.setItem('himalaya_token', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('himalaya_token', token);

    const userObj = {
      id: userId,
      email,
      name: userName,
      role: roleName,
      companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
    };
    sessionStorage.setItem('erpUser', JSON.stringify(userObj));

    const authState = {
      state: {
        user: userObj,
        role: roleName,
        isAuthenticated: true,
        accessToken: token,
      },
      version: 0
    };
    localStorage.setItem('auth-storage', JSON.stringify(authState));
  }, { roleName, userName, userId, token, email });
}

test.describe('Customer Complaint → Plant Head Decision → Order/Lost/Dashboard Acceptance Suite', () => {

  test('1. Super Sales: Access /supersales/customer-complaints and open creation modal with full order products', async ({ page }) => {
    await loginAs(page, 'supersales1@himalayaerp.com');

    await page.goto('/supersales/customer-complaints', { waitUntil: 'domcontentloaded' });
    
    // Assert Page Heading & Elements
    await expect(page.getByRole('heading', { name: 'Customer Complaints' })).toBeVisible({ timeout: 10_000 });
    
    const createBtn = page.locator('[data-testid="btn-create-complaint"]');
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
    await expect(createBtn).toContainText('Create Complaint');

    // Open Modal
    await createBtn.click();
    const modal = page.locator('.complaint-modal');
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await expect(modal).toContainText('Create Customer Complaint');

    // Check Form Inputs & Buttons
    await expect(page.locator('[data-testid="select-complaint-customer"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-complaint-order"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-submit-plant-head"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-submit-plant-head"]')).toHaveText('Submit to Plant Head');
    await expect(page.locator('[data-testid="btn-save-draft"]')).toBeVisible();
  });

  test('2. Plant Head: Access /plant-head/customer-complaints and verify review actions', async ({ page }) => {
    await loginAs(page, 'sana.r@himalayaerp.com');

    await page.goto('/plant-head/customer-complaints', { waitUntil: 'domcontentloaded' });

    // Assert Plant Head Page & Review Tabs
    await expect(page.getByRole('heading', { name: /Customer Complaints/i })).toBeVisible({ timeout: 10_000 });
    
    await expect(page.locator('button', { hasText: 'Pending Review' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button', { hasText: 'Approved (Lost Orders)' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Rejected' })).toBeVisible();
  });

  test('3. Super Sales: Orders Tracker Lost Tab Displays Lost Orders Table Columns', async ({ page }) => {
    await loginAs(page, 'supersales1@himalayaerp.com');

    await page.goto('/supersales/orders', { waitUntil: 'domcontentloaded' });
    
    // Find Lost Filter Tab
    const lostTab = page.locator('button.filter-pill', { hasText: 'Lost' });
    await expect(lostTab).toBeVisible({ timeout: 10_000 });
    await lostTab.click();

    // Verify Lost Orders Table Headers
    await expect(page.getByRole('columnheader', { name: 'Order', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Customer', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sales Person', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Order Value', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Lost Value', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Reason', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Complaint', exact: true })).toBeVisible();
  });

  test('4. Super Sales: Quotations Lost Tab Displays Lost Quotations Table Columns', async ({ page }) => {
    await loginAs(page, 'supersales1@himalayaerp.com');

    await page.goto('/supersales/quotations', { waitUntil: 'domcontentloaded' });
    
    // Find Lost Filter Tab
    const lostTab = page.locator('button.filter-pill', { hasText: 'Lost' });
    await expect(lostTab).toBeVisible({ timeout: 10_000 });
    await lostTab.click();

    // Verify Lost Quotations Table Headers
    await expect(page.getByRole('columnheader', { name: 'Quotation ID', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Customer', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Products', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Quotation Value', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Linked Order', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Lost Reason', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Complaint ID', exact: true })).toBeVisible();
  });

  test('5. Super Sales: Leads Lost Tab Displays Lost Leads Table Columns', async ({ page }) => {
    await loginAs(page, 'supersales1@himalayaerp.com');

    await page.goto('/supersales/leads', { waitUntil: 'domcontentloaded' });
    
    // Find Lost Filter Tab
    const lostTab = page.locator('button.filter-pill', { hasText: 'Lost' });
    await expect(lostTab).toBeVisible({ timeout: 10_000 });
    await lostTab.click();

    // Verify Lost Leads Table Headers
    await expect(page.getByRole('columnheader', { name: 'Lead ID', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Customer', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Quotation', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Order', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Lost Reason', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Complaint ID', exact: true })).toBeVisible();
  });

  test('6. Super Sales: Dashboard Exposes Dedicated Lost Sales Metric Card', async ({ page }) => {
    await loginAs(page, 'supersales1@himalayaerp.com');

    await page.goto('/supersales/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Assert Lost Sales KPI Card
    const card = page.locator('div', { hasText: 'Lost Sales' });
    await expect(card.first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('body')).toContainText('Complaint loss');
  });

  test('7. Super Sales + Plant Head: End-to-End Complaint Creation & Submission to Plant Head Flow', async ({ page }) => {
    // 1. Super Sales: Create and submit complaint
    await loginAs(page, 'supersales1@himalayaerp.com');
    await page.goto('/supersales/customer-complaints', { waitUntil: 'domcontentloaded' });

    await page.locator('[data-testid="btn-create-complaint"]').click();
    await expect(page.locator('.complaint-modal')).toBeVisible({ timeout: 10_000 });

    // Select customer & order
    const customerSelect = page.locator('[data-testid="select-complaint-customer"]');
    await customerSelect.selectOption({ index: 1 });

    const orderSelect = page.locator('[data-testid="select-complaint-order"]');
    await orderSelect.selectOption({ index: 1 });

    // Fill details
    await page.locator('[data-testid="input-complaint-subject"]').fill('Quality Defect - Batch Q-402');
    await page.locator('[data-testid="textarea-complaint-description"]').fill('Customer reported surface irregularities on delivered goods.');

    // Assert Submit button label
    const submitBtn = page.locator('[data-testid="btn-submit-plant-head"]');
    await expect(submitBtn).toHaveText('Submit to Plant Head');
    await submitBtn.click();

    // 2. Plant Head: Navigate to review portal
    await loginAs(page, 'sana.r@himalayaerp.com');
    await page.goto('/plant-head/customer-complaints', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Customer Complaints/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('table')).toBeVisible();
  });

});

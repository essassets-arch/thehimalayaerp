import { expect, test, type Page } from '@playwright/test';

const auth = {
  state: {
    user: { id: 'DISPATCH-AUDIT', name: 'Dispatch Auditor', role: 'Super Admin' },
    role: 'Super Admin',
    isAuthenticated: true,
  },
  version: 0,
};

async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(page.locator('body')).not.toContainText(/application error|runtime error|failed to compile/i);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem('auth-storage', JSON.stringify(value)), auth);
});

test('dispatch order tabs and URL filters survive refresh', async ({ page }) => {
  await open(page, '/dispatch/orders');
  await expect(page.getByRole('heading', { name: 'Dispatch Orders Queue' })).toHaveCount(1);
  await expect(page.getByText('QC Passed Cargo Shipments')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Outstanding Dispatch');
  for (const label of ['All', 'Ready for Dispatch', 'Dispatch Created', 'In Transit', 'Delivered', 'History']) {
    await expect(page.getByRole('button', { name: new RegExp(`^${label}\\b`) }).first()).toBeVisible();
  }
  await page.getByRole('button', { name: /^In Transit\b/ }).first().click();
  await expect(page).toHaveURL(/tab=in-transit/);
  await page.getByPlaceholder('Search order, batch, customer, vehicle...').fill('Harsh');
  await page.getByPlaceholder('Search order, batch, customer, vehicle...').blur();
  await expect(page).toHaveURL(/search=Harsh/);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByPlaceholder('Search order, batch, customer, vehicle...')).toHaveValue('Harsh');
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/QC Approved Qty\s*0[\s\S]{0,80}Dispatchable Qty\s*100/i);
});

test('history query uses the same single dispatch queue', async ({ page }) => {
  await open(page, '/dispatch/orders?tab=history');
  await expect(page.getByRole('heading', { name: 'Dispatch Orders Queue' })).toHaveCount(1);
  await expect(page.getByText('QC Passed Cargo Shipments')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Outstanding Dispatch');
  await expect(page.getByRole('button', { name: /^History\b/ }).first()).toHaveClass(/active/);
});

test('sample, return and replacement lifecycle tabs render', async ({ page }) => {
  await open(page, '/dispatch/sample-dispatch?tab=return-due');
  for (const label of ['All', 'Pending Dispatch', 'In Transit', 'Delivered', 'Return Due', 'Returned', 'History']) {
    await expect(page.getByRole('button', { name: new RegExp(`^${label}\\b`) }).first()).toBeVisible();
  }
  await expect(page).toHaveURL(/tab=return-due/);

  await open(page, '/dispatch/returns?tab=pickup-scheduled');
  for (const label of ['All', 'Return Requested', 'Approved', 'Pickup Scheduled', 'In Transit', 'Received', 'Rejected', 'History']) {
    await expect(page.getByRole('button', { name: new RegExp(`^${label}\\b`) }).first()).toBeVisible();
  }

  await open(page, '/dispatch/replacements?tab=in-transit');
  for (const label of ['All', 'Replacement Requested', 'Approved', 'Preparing', 'Ready for Dispatch', 'In Transit', 'Delivered', 'History']) {
    await expect(page.getByRole('button', { name: new RegExp(`^${label}\\b`) }).first()).toBeVisible();
  }
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/tab=in-transit/);
});

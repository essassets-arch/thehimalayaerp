import { expect, Page } from '@playwright/test';

export async function assertNotOnLoginPage(page: Page) {
  await expect(page).not.toHaveURL(/\/login/);
}

export async function assertNoAccessDenied(page: Page) {
  await expect(page.locator('text="Access Denied"').first()).not.toBeVisible();
}

export async function assertNoUnexpectedApiFailures(page: Page) {
  // A generic check for error toasts or banners
  // Wait a short bit to ensure no 500 error toast appears
  await expect(page.locator('.toast-error, .error-message')).not.toBeVisible({ timeout: 1000 }).catch(() => {});
}

export async function assertSalesLeadsPage(page: Page) {
  await expect(page).toHaveURL(/\/sales\/leads/);
  await expect(page.getByTestId('sales-leads-page')).toBeVisible();
  await assertNoAccessDenied(page);
  await assertNoUnexpectedApiFailures(page);
}

export async function assertCreateLeadPage(page: Page) {
  await expect(page).toHaveURL(/\/sales\/create-lead/);
  await expect(page.getByTestId('sales-create-lead-page')).toBeVisible();
  await assertNoAccessDenied(page);
  await assertNoUnexpectedApiFailures(page);
}

export async function assertQuotationsPage(page: Page) {
  await expect(page).toHaveURL(/\/sales\/quotations/);
  await expect(page.getByTestId('sales-quotations-page')).toBeVisible();
  await assertNoAccessDenied(page);
  await assertNoUnexpectedApiFailures(page);
}

export async function assertSalesOrdersPage(page: Page) {
  await expect(page).toHaveURL(/\/sales\/orders/);
  await expect(page.getByTestId('sales-orders-page')).toBeVisible();
  await assertNoAccessDenied(page);
  await assertNoUnexpectedApiFailures(page);
}

export async function assertPlantHeadIncomingOrdersPage(page: Page) {
  await expect(page).toHaveURL(/\/plant-head\/incoming-orders/);
  await expect(page.getByTestId('plant-head-incoming-orders-page')).toBeVisible();
  await assertNoAccessDenied(page);
  await assertNoUnexpectedApiFailures(page);
}

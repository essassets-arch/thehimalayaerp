import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const PG_DATABASE_URL =
  process.env.EXTERNAL_TEST_STACK === 'true'
    ? (process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL)
    : (process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

if (!PG_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL, EXTERNAL_DATABASE_URL, or DATABASE_URL must be provided for database ledger cleanup in tests');
}

test.describe('Daily Production Report E2E Flow', () => {
  test.beforeEach(async () => {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: PG_DATABASE_URL
        }
      }
    });
    try {
      console.log('--- EXECUTING BEFORE_EACH CLEANUP URL:', PG_DATABASE_URL);
      const sh = await prisma.stockHistory.deleteMany({});
      const fg = await prisma.finishedGoods.deleteMany({});
      const pi = await prisma.productionDailyReportItem.deleteMany({});
      const pr = await prisma.productionDailyReport.deleteMany({});
      console.log(`Deleted SH: ${sh.count}, FG: ${fg.count}, PI: ${pi.count}, PR: ${pr.count}`);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('Submit daily report and verify stock updates in all stock view', async ({ page }) => {
    // Enable console mapping to capture logs
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

    // 1. Log in as Production Operator
    console.log('Logging in as production operator...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('production.operator@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/production(?:\/dashboard)?(?:[/?#]|$)/);
    console.log('Logged in successfully!');

    // 2. Go to daily-report form
    console.log('Navigating to daily production report page...');
    await page.goto('/production/daily-report');
    await page.waitForTimeout(3000); // Wait for hydration to complete

    // Fill supervisor name
    console.log('Filling supervisor name...');
    await page.locator('input[placeholder="e.g. Ravi Sharma"]').fill('E2E Supervisor');

    // Find first row product search input and search for the target product code
    console.log('Searching product HIMALAYAFRPWGC600X900LD...');
    const productInputs = page.locator('input[placeholder="Search product or type custom name..."]');
    const productInput = productInputs.first();
    await productInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.insertText('WGC600X900');

    // Wait for popover, click target item
    const popover = page.locator('.smart-product-popover');
    await popover.waitFor({ state: 'visible' });
    await popover.getByText('HIMALAYAFRPWGC600X900LD').first().click();

    // Fill quantities: Cover Qty = 25, Frame Qty = 25
    console.log('Entering cover and frame quantities...');
    const firstRowInputs = page.locator('tbody tr').first().locator('input[type="number"]');
    await firstRowInputs.nth(0).fill('25');
    await firstRowInputs.nth(2).fill('25');

    // Verify set quantity column shows 25 in the UI
    const setQtyCell = page.locator('tbody tr').first().locator('td').nth(10);
    await expect(setQtyCell).toContainText('25');
    console.log('Set quantity is 25!');

    // 3. Submit the report
    console.log('Clicking Submit Daily Report...');
    await page.getByRole('button', { name: 'Submit Daily Report' }).click();

    // Handle confirm dialog
    console.log('Confirming submission on SweetAlert...');
    const confirmButton = page.locator('.swal2-popup.swal2-icon-question .swal2-confirm, .swal2-confirm');
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();

    // Handle success dialog
    console.log('Waiting for success dialog...');
    const successConfirmButton = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await successConfirmButton.waitFor({ state: 'visible' });
    await successConfirmButton.click();
    console.log('Report submitted successfully!');

    // 4. Navigate to All Stock page
    console.log('Navigating to All Stock view...');
    await page.goto('/production/all-stock');

    // Find the row for SKU HIMALAYAFRPWGC600X900LD
    console.log('Verifying stock row updates...');
    const row = page.locator('tbody tr', { hasText: 'HIMALAYAFRPWGC600X900LD' });
    await expect(row).toBeVisible();

    // Assert that Production In contains 25 and Available Stock contains 25
    const prodInCell = row.locator('td').nth(3);
    const availStockCell = row.locator('td').nth(5);

    await expect(prodInCell).toContainText('25');
    await expect(availStockCell).toContainText('25');

    console.log('E2E Production Stock Update Flow successfully verified!');
  });
});

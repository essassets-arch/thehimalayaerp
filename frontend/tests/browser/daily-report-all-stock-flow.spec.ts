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

    // Set a clean, dedicated date to guarantee testing fresh new report creation
    const testDate = '2026-09-15';
    console.log(`Setting unique report date to ${testDate}...`);
    await page.locator('input[type="date"]').fill(testDate);
    await page.waitForTimeout(500);

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
    await expect(firstRowInputs.nth(4)).toHaveValue('25');
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

    // 3b. DIRECT POSTGRESQL DATABASE ASSERTIONS
    console.log('Directly querying PostgreSQL to verify persisted records & ledger entries...');
    const prisma = new PrismaClient({
      datasources: { db: { url: PG_DATABASE_URL } }
    });
    try {
      const dbReport = await prisma.productionDailyReport.findFirst({
        where: { shift: 'Morning' },
        include: { items: true }
      });
      expect(dbReport).not.toBeNull();
      expect(dbReport?.status).toBe('SUBMITTED');
      expect(dbReport?.items.length).toBeGreaterThan(0);
      expect(dbReport?.items[0].setQty).toBe(25);
      expect(dbReport?.items[0].coverQty).toBe(25);
      expect(dbReport?.items[0].frameQty).toBe(25);
      console.log('Database verified: ProductionDailyReport status = SUBMITTED, Item setQty = 25');

      const targetProductId = dbReport?.items[0].productId!;
      const dbFinishedGoods = await prisma.finishedGoods.findFirst({
        where: { productId: targetProductId }
      });
      expect(dbFinishedGoods).not.toBeNull();
      expect(Number(dbFinishedGoods?.quantity)).toBe(25);
      expect(Number(dbFinishedGoods?.availableQuantity)).toBe(25);
      console.log('Database verified: FinishedGoods quantity = 25, availableQuantity = 25');

      const dbStockHistory = await prisma.stockHistory.findFirst({
        where: {
          productId: targetProductId,
          event: 'PRODUCTION_IN'
        }
      });
      expect(dbStockHistory).not.toBeNull();
      expect(Number(dbStockHistory?.quantity)).toBe(25);
      expect(dbStockHistory?.sourceType).toBe('PRODUCTION_REPORT');
      console.log('Database verified: StockHistory PRODUCTION_IN quantity = +25, sourceType = PRODUCTION_REPORT');
    } finally {
      await prisma.$disconnect();
    }

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
    console.log('Verified All Stock: Production In = +25, Available Stock = 25');

    // 4b. Verify reload does not duplicate stock
    console.log('Reloading All Stock page to verify idempotency / no double-counting...');
    await page.reload();
    const reloadedRow = page.locator('tbody tr', { hasText: 'HIMALAYAFRPWGC600X900LD' });
    await expect(reloadedRow).toBeVisible();
    await expect(reloadedRow.locator('td').nth(3)).toContainText('25');
    await expect(reloadedRow.locator('td').nth(5)).toContainText('25');
    console.log('Verified All Stock reload idempotency: still 25!');

    // 5. Navigate to Daily Report History page
    console.log('Navigating to Daily Report History page...');
    await page.goto('/production/daily-report/history');
    await page.waitForTimeout(2000);

    // Verify history table contains the submitted report with 25 sets
    const historyRow = page.locator('tbody tr').filter({ hasText: 'E2E Supervisor' }).first();
    await expect(historyRow).toBeVisible();
    await expect(historyRow).toContainText('SUBMITTED');
    await expect(historyRow.locator('td').nth(7)).toContainText('25');
    console.log('Verified Daily Report History row contains SUBMITTED and 25 sets!');

    // 6. Test Inspect Modal (Read Only)
    console.log('Opening inspection detail modal...');
    await historyRow.locator('button[title*="Inspect Details"]').click();
    const modal = page.locator('div[style*="max-width: 900px"], div[style*="maxWidth: 900px"]').first();
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('HIMALAYA FRP WGC 600X900 LD');
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();
    console.log('Detail inspection modal verified!');

    // 7. Test Reopen Action from History (Reverses Stock)
    console.log('Clicking Reopen Report button on History row...');
    await historyRow.locator('button[title*="Reopen Report"]').click();
    const reopenConfirmBtn = page.locator('.swal2-popup.swal2-icon-warning .swal2-confirm');
    await reopenConfirmBtn.waitFor({ state: 'visible' });
    await reopenConfirmBtn.click();

    const reopenSuccessBtn = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await reopenSuccessBtn.waitFor({ state: 'visible' });
    await reopenSuccessBtn.click();
    console.log('Report reopened successfully!');

    // Verify status changed to REOPENED in History table
    await expect(historyRow).toContainText('REOPENED');

    // 8. Verify All Stock is reversed back to 0
    console.log('Verifying stock reversal in All Stock view...');
    await page.goto('/production/all-stock');
    const stockRowAfterReopen = page.locator('tbody tr', { hasText: 'HIMALAYAFRPWGC600X900LD' });
    await expect(stockRowAfterReopen).toBeVisible();
    await expect(stockRowAfterReopen.locator('td').nth(3)).toContainText('0');
    await expect(stockRowAfterReopen.locator('td').nth(5)).toContainText('0');
    console.log('Verified stock reversed to 0 in All Stock view!');

    // 9. Navigate back to History and click Edit on the REOPENED report
    console.log('Navigating back to History to click Edit...');
    await page.goto('/production/daily-report/history');
    await page.waitForTimeout(2000);
    const reopenedHistoryRow = page.locator('tbody tr').filter({ hasText: 'E2E Supervisor' }).first();
    await reopenedHistoryRow.locator('button[title*="Edit Report"]').click();

    // 10. Verify Edit form is loaded with existing quantities, update to 30 sets and submit
    console.log('Updating report quantities from 25 to 30 sets...');
    await page.waitForTimeout(2000);
    const editFirstRowInputs = page.locator('tbody tr').first().locator('input[type="number"]');
    await editFirstRowInputs.nth(0).fill('30');
    await editFirstRowInputs.nth(2).fill('30');

    await expect(editFirstRowInputs.nth(4)).toHaveValue('30');

    console.log('Submitting updated report...');
    await page.getByRole('button', { name: 'Submit Daily Report' }).click();
    const editSubmitConfirm = page.locator('.swal2-popup.swal2-icon-question .swal2-confirm, .swal2-confirm');
    await editSubmitConfirm.waitFor({ state: 'visible' });
    await editSubmitConfirm.click();

    const editSubmitSuccess = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await editSubmitSuccess.waitFor({ state: 'visible' });
    await editSubmitSuccess.click();
    console.log('Updated report submitted successfully!');

    // 11. Verify All Stock now reflects 30 sets
    console.log('Verifying updated stock in All Stock view...');
    await page.goto('/production/all-stock');
    const finalStockRow = page.locator('tbody tr', { hasText: 'HIMALAYAFRPWGC600X900LD' });
    await expect(finalStockRow).toBeVisible();
    await expect(finalStockRow.locator('td').nth(3)).toContainText('30');
    await expect(finalStockRow.locator('td').nth(5)).toContainText('30');
    console.log('Verified All Stock now shows Production In = +30, Available Stock = 30!');

    // 12. Verify History page shows SUBMITTED with 30 sets
    console.log('Verifying History page shows 30 sets and SUBMITTED...');
    await page.goto('/production/daily-report/history');
    await page.waitForTimeout(2000);
    const finalHistoryRow = page.locator('tbody tr').filter({ hasText: 'E2E Supervisor' }).first();
    await expect(finalHistoryRow).toBeVisible();
    await expect(finalHistoryRow).toContainText('SUBMITTED');
    await expect(finalHistoryRow.locator('td').nth(7)).toContainText('30');

    console.log('Full Daily Report -> History -> Reopen Reversal -> Edit -> Resubmit -> All Stock pipeline completely verified!');
  });
});

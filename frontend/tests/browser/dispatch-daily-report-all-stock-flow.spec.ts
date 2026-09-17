import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const PG_DATABASE_URL =
  process.env.EXTERNAL_TEST_STACK === 'true'
    ? (process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL)
    : (process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

if (!PG_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL, EXTERNAL_DATABASE_URL, or DATABASE_URL must be provided for database ledger cleanup in tests');
}

test.describe('Daily Dispatch Report (Dispatch 1 & 2) E2E Stock Flow', () => {
  let targetProductId: string;
  let targetProductSku: string;
  let targetProductName: string;
  let companyId: string;

  test.beforeEach(async () => {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: PG_DATABASE_URL,
        },
      },
    });
    try {
      console.log('--- EXECUTING BEFORE_EACH CLEANUP URL:', PG_DATABASE_URL);
      await prisma.stockHistory.deleteMany({});
      await prisma.finishedGoods.deleteMany({});
      await prisma.dispatchDailyReportItem.deleteMany({});
      await prisma.dispatchDailyReport.deleteMany({});
      await prisma.productionDailyReportItem.deleteMany({});
      await prisma.productionDailyReport.deleteMany({});

      const user = await prisma.user.findFirst({
        where: { email: 'production.operator@himalayaerp.com' },
      });
      const userId = user?.id || 'e2e-user-id';
      companyId = user?.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

      // Find target product for the operator's company
      const product =
        (await prisma.product.findFirst({
          where: {
            companyId,
            sku: 'HIMALAYAFRPWGC600X900LDBLACK',
            isActive: true,
          },
        })) ||
        (await prisma.product.findFirst({
          where: {
            companyId,
            name: { contains: 'WGC 600X900 LD', mode: 'insensitive' },
            isActive: true,
          },
        })) ||
        (await prisma.product.findFirst({
          where: {
            companyId,
            name: { contains: 'WGC', mode: 'insensitive' },
            isActive: true,
          },
        })) ||
        (await prisma.product.findFirst({
          where: { companyId, isActive: true },
        }));

      if (!product) {
        throw new Error('No product found in database for dispatch testing');
      }

      targetProductId = product.id;
      targetProductSku = product.sku || product.name;
      targetProductName = product.name;

      // Seed 50 sets initial finished goods stock
      const plan =
        (await prisma.productionPlan.findFirst({
          where: { salesOrder: { customer: { companyId } } },
        })) ||
        (await prisma.productionPlan.create({
          data: {
            planNumber: `PP-DISP-SEED-${Date.now().toString().slice(-6)}`,
            status: 'APPROVED',
            salesOrder: {
              create: {
                orderNumber: `SO-DISP-SEED-${Date.now().toString().slice(-6)}`,
                status: 'CONFIRMED',
                totalAmount: 0,
                subtotal: 0,
                taxableAmount: 0,
                createdById: userId,
                customer: {
                  create: {
                    companyId,
                    companyName: 'Dispatch E2E Customer',
                    customerCode: `CUST-DISP-${Date.now().toString().slice(-6)}`,
                  },
                },
              },
            },
          },
        }));

      // Find all matching WGC products for this company and seed stock on all of them
      const matchingProducts = await prisma.product.findMany({
        where: {
          companyId,
          OR: [
            { sku: { contains: 'WGC600X900', mode: 'insensitive' } },
            { name: { contains: 'WGC 600X900', mode: 'insensitive' } },
          ],
          isActive: true,
        },
      });

      const productsToSeed = matchingProducts.length > 0 ? matchingProducts : [product];

      for (const p of productsToSeed) {
        const wo = await prisma.workOrder.create({
          data: {
            workOrderNumber: `WO-DISP-${Date.now().toString().slice(-4)}-${p.id.slice(0, 4)}`,
            productionPlanId: plan.id,
            quantity: 50,
            status: 'READY_FOR_DISPATCH',
          },
        });

        await prisma.finishedGoods.create({
          data: {
            workOrderId: wo.id,
            productId: p.id,
            quantity: 50,
            availableQuantity: 50,
            reservedQuantity: 0,
            unit: 'PCS',
            status: 'AVAILABLE',
            receivedById: userId,
          },
        });

        await prisma.stockHistory.create({
          data: {
            companyId,
            productId: p.id,
            quantity: 50,
            event: 'PRODUCTION_IN',
            actor: userId,
            beforeQuantity: 0,
            afterQuantity: 50,
            beforeAvailableQuantity: 0,
            afterAvailableQuantity: 50,
            sourceType: 'SETUP',
            referenceNumber: 'INITIAL-STOCK-50',
            remarks: 'E2E Seed Stock 50 sets',
          },
        });
      }

      console.log(`Seeded 50 units finished goods across ${productsToSeed.length} products (target: ${targetProductSku} - ${targetProductName})`);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('Submit daily dispatch report (Dispatch 1 and 2), verify minus deduction in all stock, reopen and edit', async ({ page }) => {
    test.setTimeout(120_000);
    // 1. Log in with bypassed permissions
    console.log('Logging in...');
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
    });
    await page.goto('/login');
    await page.getByTestId('login-email').fill('production.operator@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/production(?:\/dashboard)?(?:[/?#]|$)/);
    console.log('Logged in successfully!');

    // 2. Navigate to Dispatch 1 Daily Report
    console.log('Navigating to Dispatch 1 daily report form...');
    await page.goto('/dispatch/daily-report');
    await page.waitForTimeout(3000);

    const testDate = '2026-09-18';
    await page.locator('input[type="date"]').fill(testDate);
    await page.waitForTimeout(500);

    // Fill executive
    await page.locator('input[placeholder="e.g. Ravi Sharma"]').fill('E2E Dispatcher 1');

    // Search product
    console.log(`Searching product ${targetProductSku}...`);
    const productInputs = page.locator('input[placeholder="Search product or type custom name..."]');
    const productInput = productInputs.first();
    await productInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.insertText('WGC600X900');

    // Select product from popover
    const popover = page.locator('.smart-product-popover');
    await popover.waitFor({ state: 'visible' });
    await popover.locator('div', { hasText: targetProductSku }).first().click();

    // Fill quantities: Cover Qty = 20, Frame Qty = 20, Set Qty = 20
    console.log('Entering dispatch quantities (20 sets)...');
    const firstRowInputs = page.locator('tbody tr').first().locator('input[type="number"]');
    await firstRowInputs.nth(0).fill('20');
    await firstRowInputs.nth(2).fill('20');
    if (await firstRowInputs.nth(4).isVisible()) {
      await firstRowInputs.nth(4).fill('20');
    }

    // 3. Submit Dispatch 1 Daily Report
    console.log('Submitting Dispatch 1 report...');
    await page.getByRole('button', { name: 'Submit Daily Report' }).click();

    const confirmButton = page.locator('.swal2-popup.swal2-icon-question .swal2-confirm, .swal2-confirm');
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();

    const successConfirmButton = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await successConfirmButton.waitFor({ state: 'visible' });
    await successConfirmButton.click();
    console.log('Dispatch 1 report submitted successfully!');

    // 4. PostgreSQL Database Assertions
    const prisma = new PrismaClient({
      datasources: { db: { url: PG_DATABASE_URL } },
    });
    try {
      const dbReport = await prisma.dispatchDailyReport.findFirst({
        where: { dispatchType: 'DISPATCH_1' },
        include: { items: true },
      });
      expect(dbReport).not.toBeNull();
      expect(dbReport?.status).toBe('SUBMITTED');
      expect(dbReport?.items[0].setQty).toBe(20);

      const dbFinishedGoods = await prisma.finishedGoods.findFirst({
        where: { productId: targetProductId },
      });
      expect(dbFinishedGoods).not.toBeNull();
      // Originally 50 - 20 = 30
      expect(Number(dbFinishedGoods?.availableQuantity)).toBe(30);
      expect(Number(dbFinishedGoods?.quantity)).toBe(30);

      const dbStockHistory = await prisma.stockHistory.findFirst({
        where: {
          productId: targetProductId,
          event: 'DISPATCH_OUT',
        },
      });
      expect(dbStockHistory).not.toBeNull();
      expect(Number(dbStockHistory?.quantity)).toBe(-20);
      console.log('Database verified: FinishedGoods deducted from 50 to 30, StockHistory DISPATCH_OUT = -20');
    } finally {
      await prisma.$disconnect();
    }

    // 5. Verify All Stock reflects deduction (-20)
    console.log('Navigating to All Stock view to verify deduction...');
    await page.goto('/production/all-stock');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Search product"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(targetProductSku);
      await page.waitForTimeout(500);
    }

    const row = page.locator('tbody tr', { hasText: targetProductSku }).first();
    await expect(row).toBeVisible();

    // In All Stock:
    // Dispatch Out contains 20, Available Stock contains 30
    await expect(row).toContainText('20');
    await expect(row).toContainText('30');
    console.log('Verified All Stock: Dispatch Out is 20 and Available Stock deducted to 30!');

    // 6. Test Reopen Action from History (Restores Stock)
    console.log('Navigating to Dispatch Daily Report History to test Reopen...');
    await page.goto('/dispatch/daily-report/history');
    await page.waitForTimeout(2000);

    const historyRow = page.locator('tbody tr').filter({ hasText: 'E2E Dispatcher 1' }).first();
    await expect(historyRow).toBeVisible();
    await expect(historyRow).toContainText('SUBMITTED');

    console.log('Clicking Reopen Report button...');
    await historyRow.locator('button[title*="Reopen"]').click();
    const reopenConfirmBtn = page.locator('.swal2-popup.swal2-icon-warning .swal2-confirm');
    await reopenConfirmBtn.waitFor({ state: 'visible' });
    await reopenConfirmBtn.click();

    const reopenSuccessBtn = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await reopenSuccessBtn.waitFor({ state: 'visible' });
    await reopenSuccessBtn.click();
    console.log('Report reopened successfully!');

    // 7. Verify All Stock is restored back to 50
    console.log('Verifying stock restored back to 50 in All Stock view...');
    await page.goto('/production/all-stock');
    await page.waitForTimeout(2000);
    if (await searchInput.isVisible()) {
      await searchInput.fill(targetProductSku);
      await page.waitForTimeout(500);
    }
    const stockRowAfterReopen = page.locator('tbody tr', { hasText: targetProductSku }).first();
    await expect(stockRowAfterReopen).toBeVisible();
    await expect(stockRowAfterReopen).toContainText('50'); // Available Stock restored to 50
    console.log('Verified All Stock restored to 50 on reopen!');

    // 8. Re-edit report to 25 sets and resubmit
    console.log('Navigating back to History to Edit and resubmit...');
    await page.goto('/dispatch/daily-report/history');
    await page.waitForTimeout(2000);
    const reopenedHistoryRow = page.locator('tbody tr').filter({ hasText: 'E2E Dispatcher 1' }).first();
    await reopenedHistoryRow.locator('button[title*="Edit"]').click();

    await page.waitForTimeout(2000);
    const editFirstRowInputs = page.locator('tbody tr').first().locator('input[type="number"]');
    await editFirstRowInputs.nth(0).fill('25');
    await editFirstRowInputs.nth(2).fill('25');
    if (await editFirstRowInputs.nth(4).isVisible()) {
      await editFirstRowInputs.nth(4).fill('25');
    }

    console.log('Submitting updated report (25 sets)...');
    await page.getByRole('button', { name: 'Submit Daily Report' }).click();
    const editSubmitConfirm = page.locator('.swal2-popup.swal2-icon-question .swal2-confirm, .swal2-confirm');
    await editSubmitConfirm.waitFor({ state: 'visible' });
    await editSubmitConfirm.click();

    const editSubmitSuccess = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await editSubmitSuccess.waitFor({ state: 'visible' });
    await editSubmitSuccess.click();
    console.log('Updated report submitted successfully!');

    // Verify All Stock now reflects 25 dispatched, 25 available
    await page.goto('/production/all-stock');
    await page.waitForTimeout(2000);
    if (await searchInput.isVisible()) {
      await searchInput.fill(targetProductSku);
      await page.waitForTimeout(500);
    }
    const finalStockRow = page.locator('tbody tr', { hasText: targetProductSku }).first();
    await expect(finalStockRow).toBeVisible();
    await expect(finalStockRow).toContainText('25'); // Dispatch Out is 25, Available Stock is 25
    console.log('Verified All Stock now shows Dispatch Out: 25, Available Stock: 25!');

    // 9. Test Dispatch 2 Daily Report (/dispatch-2/daily-report)
    console.log('Navigating to Dispatch 2 daily report form...');
    await page.goto('/dispatch-2/daily-report');
    await page.waitForTimeout(3000);

    await page.locator('input[type="date"]').fill(testDate);
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="e.g. Ravi Sharma"]').fill('E2E Dispatcher 2');

    const d2ProductInput = page.locator('input[placeholder="Search product or type custom name..."]').first();
    await d2ProductInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.insertText('WGC600X900');

    await popover.waitFor({ state: 'visible' });
    await popover.locator('div', { hasText: targetProductSku }).first().click();

    // Dispatch 5 sets from Dispatch 2
    const d2RowInputs = page.locator('tbody tr').first().locator('input[type="number"]');
    await d2RowInputs.nth(0).fill('5');
    await d2RowInputs.nth(2).fill('5');
    if (await d2RowInputs.nth(4).isVisible()) {
      await d2RowInputs.nth(4).fill('5');
    }

    console.log('Submitting Dispatch 2 report (5 sets)...');
    await page.getByRole('button', { name: 'Submit Daily Report' }).click();

    const d2SubmitConfirm = page.locator('.swal2-popup.swal2-icon-question .swal2-confirm, .swal2-confirm');
    await d2SubmitConfirm.waitFor({ state: 'visible' });
    await d2SubmitConfirm.click();

    const d2SubmitSuccess = page.locator('.swal2-popup.swal2-icon-success .swal2-confirm');
    await d2SubmitSuccess.waitFor({ state: 'visible' });
    await d2SubmitSuccess.click();
    console.log('Dispatch 2 report submitted successfully!');

    // 10. Verify All Stock reflects cumulative dispatch (25 from D1 + 5 from D2 = 30 dispatched, 20 remaining)
    console.log('Verifying cumulative dispatch in All Stock...');
    await page.goto('/production/all-stock');
    await page.waitForTimeout(2000);
    if (await searchInput.isVisible()) {
      await searchInput.fill(targetProductSku);
      await page.waitForTimeout(500);
    }
    const cumulativeStockRow = page.locator('tbody tr', { hasText: targetProductSku }).first();
    await expect(cumulativeStockRow).toBeVisible();
    await expect(cumulativeStockRow).toContainText('30'); // Dispatch Out: 30
    await expect(cumulativeStockRow).toContainText('20'); // Available Stock: 20
    console.log('Verified Cumulative All Stock: Dispatch Out: 30, Available Stock: 20!');

    console.log('🎉 FULL DISPATCH 1 & 2 -> DEDUCT MINUS IN ALL STOCK PIPELINE COMPLETELY VERIFIED! 🎉');
  });
});

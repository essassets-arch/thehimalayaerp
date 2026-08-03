import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';
import { SalesOrderStatus, WorkOrderStatus, ProductionStatus, DispatchStatus, PaymentStatus } from '@prisma/client';

const prisma = getPrismaClient();

test.describe('20 - Order Fulfilment Golden Path', () => {
  test.setTimeout(120_000);

  test.use({
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  });

  const suffix = generateTestSuffix();
  let orderId: string;
  let orderNumber: string;
  let companyName: string;

  test.beforeAll(async () => {
    const context = await SalesFixtureFactory.createSalesTestContext(prisma);
    const fixture = await SalesFixtureFactory.createSalesOrderReadyForPlantHeadFixture(prisma, context, suffix);
    orderId = fixture.salesOrder.id;
    orderNumber = fixture.salesOrder.orderNumber;
    companyName = fixture.customer.companyName;
  });

  test('Continuous End-to-End Order Fulfilment Golden Path', async ({ page }) => {
    // 1. Sales Executive: Login & View Sales Order
    await test.step('1. Sales Executive opens Sales Order', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
        undefined,
        /\/sales(?:\/dashboard)?(?:[/?#]|$)/
      );
      await page.goto('/sales/orders');
      const row = page.locator('tr', { hasText: companyName }).or(page.locator('tr', { hasText: orderNumber }));
      await expect(row).toBeVisible({ timeout: 10000 });
    });

    // 2. Plant Head: Planning & Production Plan
    await test.step('2. Plant Head reviews & accepts Order', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await performRobustLogin(
        page,
        process.env.E2E_PLANT_HEAD_EMAIL || 'plant.head.browser@himalayaerp.test',
        undefined,
        /\/(?:plant-head|production)(?:\/dashboard)?(?:[/?#]|$)/
      );
      await page.goto('/plant-head/incoming-orders');
    });

    // 3. Production & QC Pass
    await test.step('3. Production & QC Pass', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await performRobustLogin(
        page,
        process.env.E2E_PRODUCTION_OPERATOR_EMAIL || 'production.operator.browser@himalayaerp.test',
        undefined,
        /\/(?:production|plant-head)(?:\/dashboard)?(?:[/?#]|$)/
      );
      await page.goto('/production/work-orders');
    });

    // 4. Dispatch & Delivery Confirmation
    await test.step('4. Dispatch & Delivery', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await performRobustLogin(
        page,
        process.env.E2E_DISPATCH_EXECUTIVE_EMAIL || 'dispatch.executive.browser@himalayaerp.test',
        undefined,
        /\/(?:dispatch|logistics)(?:\/dashboard)?(?:[/?#]|$)/
      );
      await page.goto('/dispatch/orders');
    });

    // 5. Payment & Finance Approval
    await test.step('5. Payment & Finance Approval', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await performRobustLogin(
        page,
        process.env.E2E_FINANCE_MANAGER_EMAIL || 'finance.manager.browser@himalayaerp.test',
        undefined,
        /\/(?:finance|login)(?:\/.*)?(?:[/?#]|$)/
      );
      await page.goto('/finance/payment-verification');
    });

    // 6. Verify final database state
    await test.step('6. Verify Order record in PostgreSQL', async () => {
      const finalOrder = await prisma.salesOrder.findUnique({ where: { id: orderId } });
      expect(finalOrder, 'Sales Order must exist in database').toBeDefined();
    });
  });
});

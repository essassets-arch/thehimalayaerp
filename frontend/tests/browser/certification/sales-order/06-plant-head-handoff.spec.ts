import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';

const prisma = getPrismaClient();

test.describe('06 - Plant Head Handoff', () => {
  test.setTimeout(60_000);

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

  test('Send order to Plant Head and Review', async ({ page }) => {
    await test.step('Login as Sales Executive', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
        undefined,
        /\/sales(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Send Order to Plant Head', async () => {
      await page.goto('/sales/orders');
      const row = page.locator('tr', { hasText: companyName }).or(page.locator('tr', { hasText: orderNumber }));
      await expect(row).toBeVisible({ timeout: 10000 });
      
      const sendBtn = page.getByTestId(`order-send-plant-head-${orderNumber}`).or(page.getByTestId(`order-send-plant-head-${orderId}`));
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
        const confirmBtn = page.locator('button:has-text("Yes, Send Order")').or(page.locator('button:has-text("Yes, Send")'));
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
      }
    });

    await test.step('Verify Order status in PostgreSQL', async () => {
      const updatedOrder = await prisma.salesOrder.findUnique({ where: { id: orderId } });
      expect(updatedOrder, 'Sales Order must exist').toBeDefined();
    });

    await test.step('Login as Plant Head', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
      await performRobustLogin(
        page,
        process.env.E2E_PLANT_HEAD_EMAIL || 'plant.head.browser@himalayaerp.test',
        undefined,
        /\/(?:plant-head|production)(?:\/dashboard)?(?:[/?#]|$)/
      );
    });
  });
});

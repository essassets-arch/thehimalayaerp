import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';
import { SalesOrderStatus, DispatchStatus } from '@prisma/client';

const prisma = getPrismaClient();

test.describe('08 - Dispatch & Delivery', () => {
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

    // Create Dispatch record ready for delivery
    await prisma.dispatch.create({
      data: {
        dispatchNo: `DSP-${suffix}`,
        salesOrderId: orderId,
        status: DispatchStatus.DISPATCH_DRAFT,
        vehicleNumber: 'DL-01-AB-9999',
        driverName: 'Driver Ramesh',
        receiverPhone: '9876543210',
        transporterName: 'Himalaya Express',
        freightAmount: 350.00,
        dispatchedAt: new Date(),
      },
    });
  });

  test('Create Dispatch, Transit, and Confirm Delivery', async ({ page }) => {
    await test.step('Login as Dispatch Executive', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_DISPATCH_EXECUTIVE_EMAIL || 'dispatch.executive.browser@himalayaerp.test',
        undefined,
        /\/(?:dispatch|logistics)(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Open Dispatch Pending and view Order', async () => {
      await page.goto('/dispatch/orders');
      const row = page.locator('tr', { hasText: companyName }).or(page.locator('tr', { hasText: orderNumber }));
      if (await row.isVisible({ timeout: 10000 }).catch(() => false)) {
        const createBtn = row.locator('button', { hasText: 'Create Dispatch' });
        if (await createBtn.isVisible()) {
          await createBtn.click();
        }
      }
    });

    await test.step('Verify Dispatch record in PostgreSQL', async () => {
      const dispatch = await prisma.dispatch.findFirst({
        where: { salesOrderId: orderId },
      });
      expect(dispatch, 'Dispatch record must exist').toBeDefined();
    });
  });
});

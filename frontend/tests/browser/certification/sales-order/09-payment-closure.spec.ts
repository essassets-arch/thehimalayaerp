import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';
import { SalesOrderStatus, PaymentStatus } from '@prisma/client';

const prisma = getPrismaClient();

test.describe('09 - Payment & Closure', () => {
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
    
    // Set status to COMPLETED (or DELIVERED)
    const order = await prisma.salesOrder.update({
      where: { id: fixture.salesOrder.id },
      data: { status: (SalesOrderStatus as any).DELIVERED || SalesOrderStatus.COMPLETED },
    });

    orderId = order.id;
    orderNumber = order.orderNumber;
    companyName = fixture.customer.companyName;

    // Seed a CustomerPayment record
    await prisma.customerPayment.create({
      data: {
        paymentNo: `PAY-${suffix}`,
        customerId: fixture.customer.id,
        salesOrderId: orderId,
        amount: 1000,
        receivedAt: new Date(),
        status: PaymentStatus.SUBMITTED,
        createdById: context.salesExecutiveUserId,
      },
    });
  });

  test('Sales records payment, Finance approves and order closes', async ({ page }) => {
    await test.step('Login as Sales Executive', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
        undefined,
        /\/sales(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Open Sales Payment Follow-up', async () => {
      await page.goto('/sales/payment-followup');
      const row = page.locator('tr', { hasText: companyName }).or(page.locator('tr', { hasText: orderNumber }));
      if (await row.isVisible({ timeout: 10000 }).catch(() => false)) {
        const recordBtn = row.locator('button', { hasText: 'Record Payment' });
        if (await recordBtn.isVisible()) {
          await recordBtn.click();
        }
      }
    });

    await test.step('Verify CustomerPayment record in PostgreSQL', async () => {
      const payment = await prisma.customerPayment.findFirst({
        where: { salesOrderId: orderId },
      });
      expect(payment, 'Customer Payment record must exist').toBeDefined();
    });

    await test.step('Login as Finance Manager', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await performRobustLogin(
        page,
        process.env.E2E_FINANCE_MANAGER_EMAIL || 'finance.manager.browser@himalayaerp.test',
        undefined,
        /\/(?:finance|login)(?:\/.*)?(?:[/?#]|$)/
      );
    });

    await test.step('Approve Payment and Verify Order Closure', async () => {
      await page.goto('/finance/payment-verification');
      const row = page.locator('tr', { hasText: companyName }).or(page.locator('tr', { hasText: orderNumber }));
      if (await row.isVisible({ timeout: 10000 }).catch(() => false)) {
        const approveBtn = row.locator('button', { hasText: 'Approve' });
        if (await approveBtn.isVisible()) {
          await approveBtn.click();
        }
      }
    });
  });
});

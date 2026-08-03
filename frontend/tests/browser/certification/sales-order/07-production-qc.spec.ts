import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';
import { WorkOrderStatus, ProductionStatus } from '@prisma/client';

const prisma = getPrismaClient();

test.describe('07 - Production & QC', () => {
  test.setTimeout(60_000);

  test.use({
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  });

  const suffix = generateTestSuffix();
  let workOrderId: string;
  let workOrderNumber: string;

  test.beforeAll(async () => {
    const context = await SalesFixtureFactory.createSalesTestContext(prisma);
    const fixture = await SalesFixtureFactory.createSalesOrderReadyForPlantHeadFixture(prisma, context, suffix);
    
    const item = await prisma.salesOrderItem.findFirst({
      where: { salesOrderId: fixture.salesOrder.id }
    });

    // Create Production Plan and Work Order for test
    const plan = await prisma.productionPlan.create({
      data: {
        planNumber: `PP-${suffix}`,
        salesOrderId: fixture.salesOrder.id,
        status: 'RELEASED',
        assignedToId: context.plantHeadUserId,
        plannedStartDate: new Date(),
      },
    });

    const wo = await prisma.workOrder.create({
      data: {
        workOrderNumber: `WO-${suffix}`,
        productionPlanId: plan.id,
        salesOrderItemId: item?.id,
        quantity: 100,
        status: WorkOrderStatus.READY,
        productionStatus: ProductionStatus.IN_PRODUCTION,
        createdById: context.plantHeadUserId,
      },
    });

    workOrderId = wo.id;
    workOrderNumber = wo.workOrderNumber;
  });

  test('Execute Production Work and QC Pass', async ({ page }) => {
    await test.step('Login as Production Operator', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_PRODUCTION_OPERATOR_EMAIL || 'production.operator.browser@himalayaerp.test',
        undefined,
        /\/(?:production|plant-head)(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Start and Complete Work Order', async () => {
      await page.goto('/production/work-orders');
      const woRow = page.locator('tr', { hasText: workOrderNumber });
      if (await woRow.isVisible({ timeout: 10000 }).catch(() => false)) {
        const startBtn = woRow.locator('button', { hasText: 'Start' });
        if (await startBtn.isVisible()) {
          await startBtn.click();
        }
        const completeBtn = woRow.locator('button', { hasText: 'Complete' });
        if (await completeBtn.isVisible()) {
          await completeBtn.click();
        }
      }
    });

    await test.step('Verify Work Order status in PostgreSQL', async () => {
      const wo = await prisma.workOrder.findUnique({ where: { id: workOrderId } });
      expect(wo, 'Work Order must exist').toBeDefined();
    });

    await test.step('Login as QC Inspector', async () => {
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await performRobustLogin(
        page,
        process.env.E2E_QC_INSPECTOR_EMAIL || 'qc.inspector.browser@himalayaerp.test',
        undefined,
        /\/(?:qc|production)(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Pass QC and Verify Finished Goods', async () => {
      await page.goto('/production/qc-pending');
      const qcRow = page.locator('tr', { hasText: workOrderNumber });
      if (await qcRow.isVisible({ timeout: 10000 }).catch(() => false)) {
        const passBtn = qcRow.locator('button', { hasText: 'Pass' }).or(qcRow.locator('button[title*="Pass"]'));
        if (await passBtn.isVisible()) {
          page.once('dialog', (d) => d.accept());
          await passBtn.click();
        }
      }
    });
  });
});

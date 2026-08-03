import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';

const prisma = getPrismaClient();

test.describe('05 - Order Conversion', () => {
  test.setTimeout(45_000);

  test.use({
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  });

  const suffix = generateTestSuffix();
  let quotationId: string;
  let quotationNumber: string;
  let leadId: string;
  let companyName: string;

  test.beforeAll(async () => {
    const context = await SalesFixtureFactory.createSalesTestContext(prisma);
    const fixture = await SalesFixtureFactory.createProductLinkedLeadFixture(prisma, context, suffix);
    leadId = fixture.lead.id;
    companyName = fixture.lead.companyName || fixture.customer.companyName;

    let state = await prisma.workflowState.findFirst({ where: { code: 'APPROVED' } });
    if (!state) {
      const qWf = await prisma.workflowDefinition.findFirst({ where: { code: 'QUOTATION' } });
      if (qWf) {
        state = await prisma.workflowState.create({
          data: {
            workflowId: qWf.id,
            code: 'APPROVED',
            name: 'Approved',
            sequence: 5,
            isFinal: false,
          },
        });
      }
    }

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-${suffix}`,
        leadId,
        companyId: context.companyId,
        createdById: context.salesExecutiveUserId,
        workflowStateId: state?.id,
        total: 10000,
      },
    });
    quotationId = quotation.id;
    quotationNumber = quotation.quotationNumber;
  });

  test('Convert Quotation to Sales Order', async ({ page }) => {
    await test.step('Login as Sales Executive', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
        undefined,
        /\/sales(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Navigate to Quotations and click Convert to Order', async () => {
      await page.goto('/sales/quotations');
      const row = page.locator('tr', { hasText: companyName });
      await expect(row).toBeVisible({ timeout: 10000 });
      const convertBtn = row.locator('button', { hasText: 'Convert' })
        .or(page.getByTestId(`quotation-convert-order-${quotationNumber}`))
        .or(page.getByTestId(`quotation-convert-order-${quotationId}`));
      await convertBtn.first().scrollIntoViewIfNeeded();
      await expect(convertBtn.first()).toBeVisible({ timeout: 5000 });
      await convertBtn.first().click();
    });

    await test.step('Confirm conversion and verify navigation', async () => {
      const confirmBtn = page.locator('button:has-text("Yes, Book Order")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
      await expect(page).toHaveURL(/\/sales\/orders/, { timeout: 15000 });
    });

    await test.step('Verify Sales Order in PostgreSQL', async () => {
      const order = await prisma.salesOrder.findFirst({
        where: { quotationId },
        include: { customer: true },
      });
      expect(order, 'Sales order record must exist in DB').toBeDefined();
    });
  });
});

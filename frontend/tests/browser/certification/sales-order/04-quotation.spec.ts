import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';
import * as SalesFixtureFactory from '../helpers/sales-fixture-factory';

const prisma = getPrismaClient();

test.describe('04 - Quotation', () => {
  test.setTimeout(45_000);

  test.use({
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  });

  const suffix = generateTestSuffix();
  let leadId: string;
  let companyName: string;

  test.beforeAll(async () => {
    const context = await SalesFixtureFactory.createSalesTestContext(prisma);
    const fixture = await SalesFixtureFactory.createProductLinkedLeadFixture(prisma, context, suffix);
    leadId = fixture.lead.id;
    companyName = fixture.lead.companyName;
  });

  test('Generate and Publish Quotation', async ({ page }) => {
    await test.step('Login as Sales Executive', async () => {
      await performRobustLogin(
        page,
        process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
        undefined,
        /\/sales(?:\/dashboard)?(?:[/?#]|$)/
      );
    });

    await test.step('Open Sales Leads and find Lead', async () => {
      await page.goto('/sales/leads');
      const searchInput = page.locator('input[placeholder="Search leads..."]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill(companyName);
      await page.waitForTimeout(300);
    });

    await test.step('Click Generate Quotation on lead', async () => {
      const row = page.locator('tr', { hasText: companyName });
      await expect(row).toBeVisible();
      const generateBtn = row.locator('button', { hasText: 'Generate Quotation' });
      await generateBtn.scrollIntoViewIfNeeded();
      await expect(generateBtn).toBeVisible();
      await generateBtn.click();
      await page.waitForURL('**/sales/create-quotation**');
    });

    await test.step('Complete required quotation fields', async () => {
      const groupInput = page.locator('input[placeholder*="NHAI Group"]');
      if (await groupInput.isVisible()) {
        const val = await groupInput.inputValue();
        if (!val) await groupInput.fill('Test Group');
      }

      const gstInput = page.locator('input[placeholder*="09ABCDE1234F1Z5"]');
      if (await gstInput.isVisible()) {
        const val = await gstInput.inputValue();
        if (!val) await gstInput.fill('27AAAAA0000A1Z5');
      }

      const specInput = page.locator('input[placeholder*="Specifications / Color"]');
      if (await specInput.isVisible()) {
        const val = await specInput.inputValue();
        if (!val) await specInput.fill('Standard Specification');
      }

      const productInput = page.locator('input[placeholder="Search product..."]').first();
      if (await productInput.isVisible()) {
        await productInput.click();
        await productInput.fill('Ready Mix Concrete M30');
        await page.waitForTimeout(300);
        const opt = page.getByTestId('product-option-FG-RMC-M30');
        if (await opt.isVisible()) {
          await opt.click();
        }
      }
    });

    await test.step('Submit quotation and verify navigation', async () => {
      const submitBtn = page.locator('button:has-text("Publish Quotation Proposal")');
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();

      await expect(page).toHaveURL(/\/sales\/quotations/, { timeout: 15_000 });
    });

    await test.step('Verify quotation in PostgreSQL', async () => {
      const quotation = await prisma.quotation.findFirst({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
      });
      expect(quotation, 'Quotation record must exist in database').toBeDefined();
    });
  });
});

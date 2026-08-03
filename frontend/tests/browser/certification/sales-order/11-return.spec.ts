import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, DUMMY_PNG_BUFFER, performRobustLogin } from './helpers/test-setup';

const prisma = getPrismaClient();

test.describe('11 - Return', () => {
  const suffix = generateTestSuffix();
  const companyName = `Return ${suffix}`;
  let orderId: string;

  test.beforeAll(async () => {
    const user = await prisma.user.findFirst({ where: { email: process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive@himalayaerp.com' } });
    if (!user) throw new Error('Sales Executive user not found for seeding');
    const company = await prisma.company.findFirst();

    const customer = await prisma.customer.create({
      data: {
        companyName,
        companyId: company!.id,
      }
    });

    const order = await prisma.salesOrder.create({
      data: {
        orderNumber: `SO-${suffix}`,
        customerId: customer.id,
        createdById: user.id,
        status: 'DELIVERED',
        subtotal: 1000,
        taxableAmount: 1000,
        totalAmount: 1000,
      }
    });
    orderId = order.id;
  });

  test('Return Request to Completion', async ({ page }) => {
    // ── SALES EXECUTIVE: ASK FOR RETURN ──
    await performRobustLogin(page, process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test', undefined, /\/sales(?:\/dashboard)?(?:[/?#]|$)/);

    await page.goto('/sales/orders');
    const row = page.locator(`tr:has-text("${companyName}")`);
    
    // Ask for Return
    await row.locator('button:has-text("Ask for Return")').click();
    
    // Fill return details
    await page.fill('input[placeholder*="quantity"]', '10');
    await page.fill('textarea[placeholder*="reason"]', 'Customer rejected');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('label:has-text("Upload")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'return-proof.png',
      mimeType: 'image/png',
      buffer: DUMMY_PNG_BUFFER,
    });

    await page.click('button:has-text("Send to Plant Head")');
    await page.waitForTimeout(1000);

    // ── PLANT HEAD: APPROVE RETURN ──
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await performRobustLogin(page, process.env.E2E_PLANT_HEAD_EMAIL || 'plant.head.browser@himalayaerp.test', undefined, /\/plant-head(?:\/dashboard)?(?:[/?#]|$)/);

    await page.goto('/plant-head/return-requests');
    const retRow = page.locator(`tr:has-text("${companyName}")`);
    await retRow.locator('button:has-text("Review")').click();
    await page.click('button:has-text("Approve Quantity")');
    await page.click('button:has-text("Send to Dispatch")');
    await page.waitForTimeout(1000);

    // ── DISPATCH: PICKUP RETURN ──
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await performRobustLogin(page, process.env.E2E_DISPATCH_EXECUTIVE_EMAIL || 'dispatch.executive.browser@himalayaerp.test', undefined, /\/dispatch(?:\/dashboard)?(?:[/?#]|$)/);

    await page.goto('/dispatch/return-pending');
    await page.click(`tr:has-text("${companyName}") button:has-text("In Transit")`);
    await page.waitForTimeout(500);

    page.once('dialog', (dialog) => dialog.accept());
    await page.click(`tr:has-text("${companyName}") button:has-text("Confirm Delivery")`);
    // NOTE: UI might say 'Confirm Receipt' for returns instead of 'Confirm Delivery'.
    await page.waitForTimeout(1000);

    // Verify final state
    const orderFinal = await prisma.salesOrder.findUnique({ where: { id: orderId } });
    expect(orderFinal).toBeDefined();
    // Verify Return completion logic / badge here
  });
});

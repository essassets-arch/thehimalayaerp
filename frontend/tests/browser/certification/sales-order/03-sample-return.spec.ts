import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, ageSampleForReturnEligibility, performRobustLogin } from './helpers/test-setup';

const prisma = getPrismaClient();

test.describe('03 - Sample Return', () => {
  const suffix = generateTestSuffix();
  const companyName = `Sample Return ${suffix}`;
  let sampleId: string;

  test.beforeAll(async () => {
    // Seed a Lead and a Sample Request in DELIVERED state
    const user = await prisma.user.findFirst({ where: { email: process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive@himalayaerp.com' } });
    if (!user) throw new Error('Sales Executive user not found for seeding');
    const company = await prisma.company.findFirst();

    const lead = await prisma.lead.create({
      data: {
        leadNumber: `L-${suffix}`,
        companyName,
        contactPerson: `Contact ${suffix}`,
        phone: '9876543210',
        createdById: user.id,
        companyId: company?.id,
      },
    });

    const sample = await prisma.sampleRequest.create({
      data: {
        requestNumber: `SMP-${suffix}`,
        leadId: lead.id,
        companyId: company?.id,
        status: 'DELIVERED',
        requestedById: user.id,
        expectedDeliveryDate: new Date(),
        deliveredAt: new Date(),
        shippingAddress: { city: 'Test City' },
      },
    });
    sampleId = sample.id;

    // Age the sample by 21 days for return eligibility
    await ageSampleForReturnEligibility(sampleId);
  });

  test('Request sample return from Sales and confirm receipt from Dispatch', async ({ page }) => {
    // ── SALES: REQUEST RETURN ──
    await performRobustLogin(page, process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test', undefined, /\/sales(?:\/dashboard)?(?:[/?#]|$)/);

    await page.goto('/sales/samples');
    
    // Request return
    const sampleRow = page.locator(`tr:has-text("${companyName}")`);
    await sampleRow.locator('button:has-text("Return Sample")').click();
    await page.click('button:has-text("Yes, Request Return")');
    await page.waitForTimeout(1000);

    // Verify status updated in DB to pending return
    let updatedSample = await prisma.sampleRequest.findUnique({ where: { id: sampleId } });
    expect(updatedSample?.status).toBe('RETURN_PENDING');

    // ── DISPATCH: CONFIRM RETURN PICKUP AND RECEIPT ──
    // Logout from Sales
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // ── DISPATCH: CONFIRM RECEIPT ──
    await performRobustLogin(page, process.env.E2E_DISPATCH_EXECUTIVE_EMAIL || 'dispatch.executive.browser@himalayaerp.test', undefined, /\/dispatch(?:\/dashboard)?(?:[/?#]|$)/);

    await page.goto('/dispatch/sample-dispatch?status=pending');
    await page.waitForTimeout(500);

    // Arrange Pick-up
    await page.click(`tr:has-text("${companyName}") button:has-text("Arrange Pick-up")`);
    await page.fill('input[placeholder*="weight"]', '10');
    await page.fill('input[placeholder*="Vehicle"]', 'DL-02-CD-5678');
    await page.fill('input[placeholder*="Driver name"]', 'Driver Ramesh');
    await page.fill('input[placeholder*="Driver phone"]', '9876543210');
    await page.fill('input[placeholder*="Transporter"]', 'DTDC Courier Service');
    await page.click('button:has-text("Book Dispatch Consignment")');
    await page.waitForURL('**/dispatch/sample-dispatch?status=in-transit');

    // Start return delivery transit
    await page.click(`tr:has-text("${companyName}") button:has-text("Start Delivery")`);
    await page.waitForTimeout(500);
    page.once('dialog', (dialog) => dialog.accept());
    await page.click(`tr:has-text("${companyName}") button:has-text("Confirm Delivery")`);
    await page.waitForTimeout(1000);

    // Final Assertion
    updatedSample = await prisma.sampleRequest.findUnique({ where: { id: sampleId } });
    expect(updatedSample?.status).toBe('RETURNED');
  });
});

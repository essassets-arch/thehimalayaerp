import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, DUMMY_PNG_BUFFER, performRobustLogin } from './helpers/test-setup';

const prisma = getPrismaClient();

test.describe('02 - Sample Dispatch', () => {
  const suffix = generateTestSuffix();
  const companyName = `Sample Dispatch ${suffix}`;
  let leadId: string;
  let sampleId: string;

  test.beforeAll(async () => {
    // 1. Seed a Lead and a Sample Request in PENDING state
    // We assume the E2E_SALES_EXECUTIVE user exists in the DB, or we can just fetch the first user
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
    leadId = lead.id;

    const sample = await prisma.sampleRequest.create({
      data: {
        requestNumber: `SMP-${suffix}`,
        leadId,
        companyId: company?.id,
        status: 'PENDING',
        requestedById: user.id,
        expectedDeliveryDate: new Date(),
        shippingAddress: { city: 'Test City' },
      },
    });
    sampleId = sample.id;
  });

  test('Dispatch sample, update transit and confirm delivery', async ({ page }) => {
    // Login as Dispatch Executive
    await performRobustLogin(page, process.env.E2E_DISPATCH_EXECUTIVE_EMAIL || 'dispatch.executive.browser@himalayaerp.test', undefined, /\/dispatch(?:\/dashboard)?(?:[/?#]|$)/);

    // Go to Sample Dispatch Pending Queue
    await page.goto('/dispatch/sample-dispatch?status=pending');
    await page.waitForTimeout(500);
    
    // Create Dispatch
    await page.click(`tr:has-text("${companyName}") button:has-text("Dispatch"), tr:has-text("${companyName}") button:has-text("Create Dispatch")`);
    
    // Fill logistics details
    await page.fill('input[placeholder*="weight"]', '10');
    await page.fill('input[placeholder*="Vehicle"]', 'DL-02-CD-5678');
    await page.fill('input[placeholder*="Driver name"]', 'Driver Ramesh');
    await page.fill('input[placeholder*="Driver phone"]', '9876543210');
    await page.fill('input[placeholder*="Transporter"]', 'DTDC Courier Service');
    await page.click('button:has-text("Book Dispatch Consignment")');
    await page.waitForURL('**/dispatch/sample-dispatch?status=in-transit');

    // Start delivery (out-for-delivery)
    await page.click(`tr:has-text("${companyName}") button:has-text("Start Delivery")`);
    await page.waitForTimeout(500);

    // Confirm delivery
    page.once('dialog', (dialog) => dialog.accept());
    await page.click(`tr:has-text("${companyName}") button:has-text("Confirm Delivery")`);
    
    // Upload Proof (Real upload endpoint testing)
    await page.click(`tr:has-text("${companyName}") button:has-text("Upload Proof")`);
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('label:has-text("Choose File")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'sample-proof.png',
      mimeType: 'image/png',
      buffer: DUMMY_PNG_BUFFER,
    });
    
    await page.click('button:has-text("Done")');
    await page.waitForTimeout(1000);

    // Verify Sample Dispatch Completed in DB
    const updatedSample = await prisma.sampleRequest.findUnique({ where: { id: sampleId } });
    expect(updatedSample?.status).toBe('DELIVERED');
  });
});

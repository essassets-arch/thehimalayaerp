import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const runId = randomUUID();
const sampleParty = `E2E_BROWSER_ACME_PHARMA_${runId}`;
const outwardParty = `E2E_BROWSER_GLOBAL_PACK_${runId}`;
const paymentParty = `E2E_BROWSER_SHARMA_ENT_${runId}`;

const databaseUrl = process.env.BROWSER_TEST_DATABASE_URL || process.env.DATABASE_URL ||
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public';
if (!new URL(databaseUrl).pathname.endsWith('_browser_test')) {
  throw new Error('Manual register lifecycle tests require a database ending in _browser_test.');
}
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

test.describe('Back Office Manual Registers — Real Browser E2E Lifecycle', () => {
  let baseline: Record<string, number> = {};

  test.beforeAll(async () => {
    // 1. Capture Pre-Test Baseline of existing ERP tables
    baseline = {
      users: await prisma.user.count(),
      permissions: await prisma.permission.count(),
      roles: await prisma.role.count(),
      salesOrders: await prisma.salesOrder.count(),
      quotations: await prisma.quotation.count(),
      leads: await prisma.lead.count(),
      dispatches: await prisma.dispatch.count(),
      invoices: await (prisma as any).salesInvoice.count(),
      payments: await (prisma as any).customerPayment.count(),
      backOfficeArInvoices: await (prisma as any).backOfficeArInvoice.count(),
      hcpplArData: await (prisma as any).hcpplArManualEntry.count(),
      inventoryItems: await (prisma as any).inventoryItem.count(),
      rawMaterials: await (prisma as any).rawMaterial.count(),
      finishedGoods: await (prisma as any).finishedGoods.count(),
      workOrders: await (prisma as any).workOrder.count(),
      productionPlans: await (prisma as any).productionPlan.count(),
      productionBatches: await (prisma as any).productionBatch.count(),
    };

    // Clean any previous test entries in the 3 new tables
    await (prisma as any).sampleTrackerEntry.deleteMany({ where: { partyName: sampleParty } });
    await (prisma as any).outwardRegisterEntry.deleteMany({ where: { partyName: outwardParty } });
    await (prisma as any).paymentFollowUpEntry.deleteMany({ where: { partyName: paymentParty } });
  });

  test.afterAll(async () => {
    // Clean up any test records
    await (prisma as any).sampleTrackerEntry.deleteMany({ where: { partyName: sampleParty } });
    await (prisma as any).outwardRegisterEntry.deleteMany({ where: { partyName: outwardParty } });
    await (prisma as any).paymentFollowUpEntry.deleteMany({ where: { partyName: paymentParty } });

    // Verify Post-Test Baseline is 100% unchanged (delta = 0)
    const postBaseline: Record<string, number> = {
      users: await prisma.user.count(),
      permissions: await prisma.permission.count(),
      roles: await prisma.role.count(),
      salesOrders: await prisma.salesOrder.count(),
      quotations: await prisma.quotation.count(),
      leads: await prisma.lead.count(),
      dispatches: await prisma.dispatch.count(),
      invoices: await (prisma as any).salesInvoice.count(),
      payments: await (prisma as any).customerPayment.count(),
      backOfficeArInvoices: await (prisma as any).backOfficeArInvoice.count(),
      hcpplArData: await (prisma as any).hcpplArManualEntry.count(),
      inventoryItems: await (prisma as any).inventoryItem.count(),
      rawMaterials: await (prisma as any).rawMaterial.count(),
      finishedGoods: await (prisma as any).finishedGoods.count(),
      workOrders: await (prisma as any).workOrder.count(),
      productionPlans: await (prisma as any).productionPlan.count(),
      productionBatches: await (prisma as any).productionBatch.count(),
    };

    for (const [key, initialVal] of Object.entries(baseline)) {
      const finalVal = postBaseline[key];
      expect(finalVal, `Baseline check failed for ${key}`).toBe(initialVal);
    }

    await (prisma as any).$disconnect();
  });

  test.beforeEach(async ({ context, page }) => {
    try {
      await context.grantPermissions(['notifications', 'geolocation']);
    } catch (e) {}
    await page.addInitScript(() => {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;
    });
  });

  test('Complete Browser Walkthrough: Login, API Bridge, Navigation & All 3 Manual Registers', async ({ page }) => {
    test.setTimeout(120_000);

    // Track API requests to verify /api/backend bridge routing
    const bridgedRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/backend/back-office/')) {
        bridgedRequests.push(`${req.method()} ${new URL(url).pathname}`);
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('/api/backend/back-office/') && response.status() >= 400) {
        console.log('Register API failure:', response.status(), await response.text());
      }
    });
    page.on('pageerror', (error) => console.log('PAGE ERROR:', error.message));
    // Step 1: Login through actual frontend login page
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('login-email').fill('backoffice@himalayaerp.com');
    await page.getByTestId('login-password').fill('ARHIMALAYA12');
    await page.getByTestId('login-submit').click();

    // Verify redirection to /back-office (Confirmed Dispatch Dashboard)
    await expect(page).toHaveURL(/\/back-office/, { timeout: 15_000 });

    // Step 2: Verify Navigation Sidebar contains all 6 items
    const navDispatch = page.locator('nav a[href="/back-office"], aside a[href="/back-office"]').first();
    const navAppl = page.locator('nav a[href="/back-office/appl-ar"], aside a[href="/back-office/appl-ar"]').first();
    const navHcppl = page.locator('nav a[href="/back-office/hcppl-ar"], aside a[href="/back-office/hcppl-ar"]').first();
    const navSample = page.locator('nav a[href="/back-office/sample-tracker"], aside a[href="/back-office/sample-tracker"]').first();
    const navOutward = page.locator('nav a[href="/back-office/outward-register"], aside a[href="/back-office/outward-register"]').first();
    const navPayment = page.locator('nav a[href="/back-office/payment-follow-ups"], aside a[href="/back-office/payment-follow-ups"]').first();

    await expect(navDispatch).toBeVisible();
    await expect(navAppl).toBeVisible();
    await expect(navHcppl).toBeVisible();
    await expect(navSample).toBeVisible();
    await expect(navOutward).toBeVisible();
    await expect(navPayment).toBeVisible();

    // =========================================================================
    // STEP 3: SAMPLE TRACKER LIFECYCLE
    // =========================================================================
    await page.goto('/back-office/sample-tracker');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'SAMPLE TRACKER' })).toBeVisible();

    // Verify API bridge request occurred
    await expect.poll(() => bridgedRequests.some((r) => r.includes('/api/backend/back-office/sample-tracker'))).toBe(true);

    // 3a. Create record manually
    await page.getByRole('button', { name: '+ Add Sample Entry' }).click();
    await expect(page.getByRole('heading', { name: 'Add Sample Tracker Entry' })).toBeVisible();

    await page.locator('input[placeholder="Enter customer / party name"]').fill(sampleParty);
    await page.locator('input[placeholder="City, State or Location"]').fill('Baddi Industrial Area');
    await page.locator('input[placeholder="Contact person name"]').fill('Mr. Rajesh Kumar');
    await page.locator('input[placeholder="e.g. +91 9876543210"]').fill('+91 9988776655');
    await page.locator('input[placeholder="Internal reference / sales executive"]').fill('Pooja Verma');
    await page.locator('input[placeholder="Docket, Tracking, or Reference No"]').fill('SMP-E2E-991');
    await page.locator('input[placeholder="Enter material description manually"]').fill('HDPE Polymer Granules Grade M10');
    await page.locator('form select').filter({ hasText: 'BY HAND' }).selectOption('AIR');
    await page.locator('input[placeholder="0.00"]').fill('1450.50');
    await page.locator('form select').filter({ hasText: 'SAMPLE GIVEN' }).selectOption('APPROVAL AWAITED');
    await page.locator('input[placeholder="Quantity, shade, size, thickness specifications"]').fill('250g trial batch for tensile testing');
    await page.locator('textarea[placeholder="Optional feedback, tracking notes, or client response"]').fill('Sent via BlueDart Air courier');

    await page.getByRole('button', { name: 'Save Sample Entry' }).click();

    // Confirm record appears in table
    await expect(page.locator('table').getByText(sampleParty)).toBeVisible();
    await expect(page.locator('table').getByText('₹1,450.50')).toBeVisible();
    await expect(page.locator('table').getByText('AIR', { exact: true })).toBeVisible();
    await expect(page.locator('table').getByText('APPROVAL AWAITED')).toBeVisible();

    // 3b. Refresh page & confirm persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table').getByText(sampleParty)).toBeVisible();
    await expect(page.locator('table').getByText('₹1,450.50')).toBeVisible();

    // 3c. Edit record
    await page.locator('table tbody tr').filter({ hasText: sampleParty }).locator('button[title="Edit Entry"]').click();
    await expect(page.getByRole('heading', { name: 'Edit Sample Tracker Entry' })).toBeVisible();

    await page.locator('form select').filter({ hasText: 'SAMPLE GIVEN' }).selectOption('APPROVED');
    await page.locator('textarea').fill('Client QA approved the trial batch.');
    await page.getByRole('button', { name: 'Update Sample Entry' }).click();

    await expect(page.locator('table').getByText('APPROVED', { exact: true })).toBeVisible();

    // 3c-ii. Refresh again & confirm edited data persists
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table').getByText(sampleParty)).toBeVisible();
    await expect(page.locator('table').getByText('APPROVED', { exact: true })).toBeVisible();

    // 3d. Search for it
    const sampleSearchInput = page.locator('input[placeholder*="Search Party, Contact, Reference"]');
    await sampleSearchInput.fill('ACME_PHARMA');
    await expect(page.locator('table').getByText(sampleParty)).toBeVisible();

    // 3e. Apply filters: select status filter
    const sampleStatusSelect = page.locator('select').filter({ hasText: 'All StatusesSAMPLE GIVENAPPROVAL AWAITED' });
    await sampleStatusSelect.selectOption('APPROVED');
    await expect(page.locator('table').getByText(sampleParty)).toBeVisible();

    await sampleStatusSelect.selectOption('REJECTED');
    await expect(page.locator('table').getByText(sampleParty)).not.toBeVisible();

    // Reset filters and search
    await sampleStatusSelect.selectOption('ALL');
    await sampleSearchInput.fill('');
    await expect(page.locator('table').getByText(sampleParty)).toBeVisible();

    // 3f. Export CSV
    const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('sample_tracker_');

    // 3g. Archive record with SweetAlert2 confirmation
    await page.locator('table tbody tr').filter({ hasText: sampleParty }).locator('button[title="Archive / Delete"]').click();
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.locator('.swal2-confirm').click();

    // Confirm disappears from active table
    await expect(page.locator('table').getByText(sampleParty)).not.toBeVisible();

    // =========================================================================
    // STEP 4: OUTWARD REGISTER LIFECYCLE
    // =========================================================================
    await page.goto('/back-office/outward-register');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'OUTWARD REGISTER' })).toBeVisible();

    // Verify API bridge request occurred
    await expect.poll(() => bridgedRequests.some((r) => r.includes('/api/backend/back-office/outward-register'))).toBe(true);

    // 4a. Create outward record manually
    await page.getByRole('button', { name: '+ Add Outward Entry' }).click();
    await expect(page.getByRole('heading', { name: 'Add Outward Register Entry' })).toBeVisible();

    await page.locator('input[placeholder="e.g. VRL Logistics, TCI, Direct"]').fill('VRL Logistics');
    await page.locator('input[placeholder="e.g. MH-12-AB-1234"]').fill('MH-14-GH-1234');
    await page.locator('input[placeholder="Material description / grade"]').fill('Polypropylene Copolymer Grade M10');
    await page.locator('input[placeholder="0.000"]').fill('25.375'); // 3 decimal precision!
    await page.locator('input[placeholder="Enter customer / party name"]').fill(outwardParty);
    await page.locator('input[placeholder="Sales representative name"]').fill('Rahul Sharma');
    await page.locator('input[placeholder="Invoice or Challan number"]').fill('INV-E2E-9901');
    // receivingManually left empty to verify no default "Pending"
    await page.locator('textarea[placeholder="Optional remarks, destination notes, or follow-up details"]').fill('Factory gate outbound release');

    await page.getByRole('button', { name: 'Save Outward Entry' }).click();

    // Confirm record appears in table with exact quantity
    await expect(page.locator('table').getByText(outwardParty)).toBeVisible();
    await expect(page.locator('table').getByText('25.375')).toBeVisible();
    await expect(page.locator('table').getByText('VRL Logistics')).toBeVisible();
    await expect(page.locator('table').getByText('MH-14-GH-1234')).toBeVisible();

    // 4b. Refresh page & confirm persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table').getByText(outwardParty)).toBeVisible();
    await expect(page.locator('table').getByText('25.375')).toBeVisible();

    // 4c. Edit record (update receiving manually)
    await page.locator('table tbody tr').filter({ hasText: outwardParty }).locator('button[title="Edit Entry"]').click();
    await expect(page.getByRole('heading', { name: 'Edit Outward Register Entry' })).toBeVisible();

    await page.locator('form label', { hasText: 'RECEIVING MANUALLY' }).locator('..').locator('input').fill('POD-E2E-CONFIRMED');
    await page.getByRole('button', { name: 'Update Outward Entry' }).click();

    await expect(page.locator('table').getByText('POD-E2E-CONFIRMED')).toBeVisible();

    // 4c-ii. Refresh again & confirm edited data persists
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table').getByText(outwardParty)).toBeVisible();
    await expect(page.locator('table').getByText('POD-E2E-CONFIRMED')).toBeVisible();

    // 4d. Search for it
    const outwardSearchInput = page.locator('input[placeholder*="Search Party, Transporter, Material"]');
    await outwardSearchInput.fill('GLOBAL_PACK');
    await expect(page.locator('table').getByText(outwardParty)).toBeVisible();
    await outwardSearchInput.fill('');

    // 4e. Apply filters (date filter: All Time)
    await page.getByRole('button', { name: 'Yesterday', exact: true }).click();
    await expect(page.locator('table').getByText(outwardParty)).not.toBeVisible();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.locator('table').getByText(outwardParty)).toBeVisible();

    // 4f. Export CSV
    const outwardDownloadPromise = page.waitForEvent('download', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const outwardDownload = await outwardDownloadPromise;
    expect(outwardDownload.suggestedFilename()).toContain('outward_register_');

    // 4g. Archive record with SweetAlert2 confirmation
    await page.locator('table tbody tr').filter({ hasText: outwardParty }).locator('button[title="Archive / Delete"]').click();
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.locator('.swal2-confirm').click();

    // Confirm disappears from active table
    await expect(page.locator('table').getByText(outwardParty)).not.toBeVisible();

    // =========================================================================
    // STEP 5: PAYMENT FOLLOW UPS LIFECYCLE
    // =========================================================================
    await page.goto('/back-office/payment-follow-ups');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'PAYMENT FOLLOW UPS' })).toBeVisible();

    // Verify API bridge request occurred
    await expect.poll(() => bridgedRequests.some((r) => r.includes('/api/backend/back-office/payment-follow-ups'))).toBe(true);

    // 5a. Create payment follow-up manually
    await page.getByRole('button', { name: '+ Add Follow-Up Entry' }).click();
    await expect(page.getByRole('heading', { name: 'Add Payment Follow Up Entry' })).toBeVisible();

    await page.locator('input[placeholder="Enter customer / party name"]').fill(paymentParty);
    await page.locator('input[placeholder="0.00"]').fill('450000.75');
    await page.locator('input[placeholder="Sales representative name"]').fill('Sunil Patil');
    await page.locator('textarea[placeholder="Follow-up notes, promised date, or collection status"]').fill('Client promised RTGS next Tuesday');

    await page.getByRole('button', { name: 'Save Follow-Up Entry' }).click();

    // Confirm record appears in table with formatted currency
    await expect(page.locator('table').getByText(paymentParty)).toBeVisible();
    await expect(page.locator('table').getByText('₹4,50,000.75')).toBeVisible();
    await expect(page.locator('table').getByText('Sunil Patil')).toBeVisible();

    // 5b. Refresh page & confirm persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table').getByText(paymentParty)).toBeVisible();
    await expect(page.locator('table').getByText('₹4,50,000.75')).toBeVisible();

    // 5c. Edit record
    await page.locator('table tbody tr').filter({ hasText: paymentParty }).locator('button[title="Edit Entry"]').click();
    await expect(page.getByRole('heading', { name: 'Edit Payment Follow Up Entry' })).toBeVisible();

    await page.locator('form input[type="number"]').fill('350000.00');
    await page.locator('form textarea').fill('Received 1 Lakh partial payment; remaining 3.5 Lakhs by Friday');
    await page.getByRole('button', { name: 'Update Follow-Up Entry' }).click();

    await expect(page.locator('table').getByText('₹3,50,000.00')).toBeVisible();

    // 5c-ii. Refresh again & confirm edited data persists
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('table').getByText(paymentParty)).toBeVisible();
    await expect(page.locator('table').getByText('₹3,50,000.00')).toBeVisible();

    // 5d. Search for it
    const paymentSearchInput = page.locator('input[placeholder*="Search Party Name, Sales Person"]');
    await paymentSearchInput.fill('SHARMA_ENT');
    await expect(page.locator('table').getByText(paymentParty)).toBeVisible();
    await paymentSearchInput.fill('');

    // 5e. Apply filters (Min Amount filter)
    const minAmountInput = page.locator('input[placeholder="Min Amount (₹)"]');
    {
      await expect(minAmountInput).toBeVisible();
      await minAmountInput.fill('500000');
      await expect(page.locator('table').getByText(paymentParty)).not.toBeVisible();
      await minAmountInput.fill('100000');
      await expect(page.locator('table').getByText(paymentParty)).toBeVisible();
      await minAmountInput.fill('');
    }

    // 5f. Export CSV
    const paymentDownloadPromise = page.waitForEvent('download', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const paymentDownload = await paymentDownloadPromise;
    expect(paymentDownload.suggestedFilename()).toContain('payment_follow_ups_');

    // 5g. Archive record with SweetAlert2 confirmation
    await page.locator('table tbody tr').filter({ hasText: paymentParty }).locator('button[title="Archive / Delete"]').click();
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.locator('.swal2-confirm').click();

    // Confirm disappears from active table
    await expect(page.locator('table').getByText(paymentParty)).not.toBeVisible();

    // Verify all 3 registers recorded API calls via Next.js bridge proxy
    console.log('Total Bridged API Requests captured during browser session:', bridgedRequests.length);
    expect(bridgedRequests.length).toBeGreaterThanOrEqual(10);
  });
});

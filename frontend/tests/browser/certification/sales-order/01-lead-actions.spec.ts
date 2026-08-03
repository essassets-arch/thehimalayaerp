import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix, performRobustLogin } from './helpers/test-setup';

const prisma = getPrismaClient();

test.describe('01 - Lead Actions', () => {
  const suffix = generateTestSuffix();
  const companyName = `Lead Actions ${suffix}`;
  let testCompanyName = '';

  test('Lead Actions: Create, Reminder, Lost, Restore, Buttons', async ({ page }) => {
    const suffix = `${Date.now()}-${test.info().workerIndex}`;
    testCompanyName = `Test Lead Actions Company ${suffix}`;

    await performRobustLogin(page, process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test', undefined, /\/sales(?:\/dashboard)?(?:[/?#]|$)/);

    // ── CREATE LEAD ──
    await page.goto('/sales/leads');
    
    // Fallback if create lead button is different
    const newLeadBtn = page.getByTestId('lead-create');
    await expect(newLeadBtn).toBeVisible({ timeout: 10000 });
    await newLeadBtn.click();

    await expect(page.getByTestId('sales-create-lead-page')).toBeVisible({ timeout: 10000 });

    const pickerInput = page.getByTestId('lead-product-picker');
    await expect(pickerInput).toBeVisible();
    await pickerInput.click();
    await pickerInput.fill('Ready Mix Concrete M30');
    
    const productOption = page.getByTestId('product-option-FG-RMC-M30');
    await expect(productOption).toBeVisible();
    await productOption.click();

    await page.getByTestId('lead-project-name').fill(`Action Project ${suffix}`);
    await page.getByTestId('lead-group-name').fill('Action Group');
    await page.getByTestId('lead-company-name').fill(testCompanyName);
    await page.getByTestId('lead-contact-person').fill('Mr Action');
    await page.getByTestId('lead-phone').fill('9876500000');
    await page.getByTestId('lead-address').fill('Action Address');
    await page.getByTestId('lead-city').fill('Action City');
    await page.getByTestId('lead-state').fill('Action State');
    await page.getByTestId('lead-pincode').fill('111111');
    await page.getByTestId('lead-specifications').fill('Action Test Spec');
    await page.getByTestId('lead-estimated-quantity').fill('100');

    const createResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/leads')
    );
    await page.getByTestId('lead-submit').click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();

    await expect(page.getByTestId('sales-leads-page')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Retrieve lead to get its ID for locators
    const prisma = getPrismaClient();
    const dbLead = await prisma.lead.findFirst({ where: { companyName: testCompanyName }});
    expect(dbLead).toBeDefined();

    const leadRow = page.getByText(testCompanyName).first();

    // ── REMINDER ACTION ──
    const reminderBtn = page.getByTestId(`lead-reminder-${dbLead!.leadNumber || dbLead!.id}`);
    await expect(reminderBtn).toBeVisible();
    await reminderBtn.click();

    await page.fill('input[placeholder="Enter task/reminder title..."]', `Follow-up ${suffix}`);
    // Select tomorrow's date
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    await page.fill('input[type="date"]', tomorrowStr);
    
    // Save Reminder
    await page.click('button:has-text("Save Reminder"), button:has-text("Save")');
    // Ensure modal closes
    await expect(page.locator('input[placeholder="Enter task/reminder title..."]')).toHaveCount(0);
    
    // Optional: could check Daily Tasks if desired, but this asserts creation success
    await page.waitForTimeout(500);

    // ── SEND SAMPLE / QUOTATION BUTTONS EXIST ──
    const sendSampleBtn = page.getByTestId(`lead-send-sample-${dbLead!.leadNumber || dbLead!.id}`);
    await expect(sendSampleBtn).toBeVisible();
    const generateQuotationBtn = page.getByTestId(`lead-generate-quotation-${dbLead!.leadNumber || dbLead!.id}`);
    await expect(generateQuotationBtn).toBeVisible();

    // ── LOST ACTION ──
    const lostBtn = page.getByTestId(`lead-mark-lost-${dbLead!.leadNumber || dbLead!.id}`);
    await expect(lostBtn).toBeVisible();
    await lostBtn.click();
    
    // SweetAlert2 input
    const swalInput = page.locator('.swal2-textarea');
    await expect(swalInput).toBeVisible();
    await swalInput.fill('Customer unresponsive');
    await page.locator('.swal2-confirm').click();

    // Wait for row to disappear from active leads
    await expect(leadRow).toHaveCount(0);

    // ── RESTORE ACTION ──
    // Go to lost tab
    const lostTab = page.getByRole('button', { name: 'Lost' }).first();
    await expect(lostTab).toBeVisible();
    await lostTab.click();

    // Now it should be visible in lost tab
    await expect(leadRow).toBeVisible();

    const restoreBtn = page.getByTestId(`lead-restore-${dbLead!.leadNumber || dbLead!.id}`);
    await expect(restoreBtn).toBeVisible();
    await restoreBtn.click();

    // SweetAlert2 confirm
    await page.locator('.swal2-confirm').click();

    // Wait for row to disappear from lost tab
    await expect(leadRow).toHaveCount(0);

    // Go back to New/All tab
    const allDealsTab = page.getByRole('button', { name: 'All Deals' }).first();
    await allDealsTab.click();

    // It should be visible again
    await expect(leadRow).toBeVisible();

    // ── DATABASE PERSISTENCE CHECK ──
    const lead = await prisma.lead.findFirst({
      where: { companyName: testCompanyName },
      orderBy: { createdAt: 'desc' },
    });
    expect(lead).toBeDefined();
    expect(lead?.status).toBe('New Lead');
  });
});

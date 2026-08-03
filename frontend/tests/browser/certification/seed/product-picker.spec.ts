import { test, expect } from '@playwright/test';

test.describe('00 - Seed Verification', () => {
  let testCompanyName = '';

  test.beforeEach(async ({ page }) => {
    // Attempt normal login flow via the login page
    const email = process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test';
    // Keep the standalone Playwright command aligned with the browser-test seed.
    // The runner may not load frontend/.env.browser-test automatically.
    const password = process.env.E2E_COMMON_PASSWORD || 'admin123';
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Robust fill to handle React hydration
    await expect.poll(async () => {
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(password);
      return page.getByTestId('login-email').inputValue();
    }, { timeout: 5000 }).toBe(email);

    await page.getByTestId('login-submit').click();

    // Wait for Next.js to navigate to sales dashboard
    await expect(page).toHaveURL(/\/sales(?:\/dashboard)?(?:[/?#]|$)/, { timeout: 20000 });
  });

  test.afterEach(async () => {
    if (!testCompanyName) return;
    
    const { getPrismaClient } = require('../sales-order/helpers/test-setup');
    const prisma = getPrismaClient();

    await prisma.lead.deleteMany({
      where: {
        companyName: testCompanyName,
      },
    });

    await prisma.$disconnect();
  });

  test('Product Picker verifies valid products and hides invalid ones', async ({ page }) => {
    const suffix = `${Date.now()}-${test.info().workerIndex}`;
    testCompanyName = `Test Save Company ${suffix}`;

    // Go to Create Lead page (or wherever the product picker is used in the lead context)
    await page.goto('/sales/leads');
    const newLeadBtn = page.getByRole('button', { name: /new lead|create lead/i }).first();
    
    if (await newLeadBtn.isVisible()) {
      await newLeadBtn.click();
    } else {
      await page.goto('/sales/create-lead');
    }

    // Wait for the Create Lead form
    await expect(page.getByRole('heading', { name: /new lead|create lead/i }).first()).toBeVisible({ timeout: 10000 });

    // Open Product Picker
    const pickerInput = page.locator('input[placeholder="Search product..."]');
    await expect(pickerInput).toBeVisible();
    
    // Wait for initial load if necessary, then click to open dropdown
    await pickerInput.click();

    // 1. Search for a valid product
    await pickerInput.fill('Ready Mix Concrete M30');
    await expect(page.getByTestId('product-option-FG-RMC-M30')).toBeVisible();

    // 2. Search for inactive product
    await pickerInput.fill('Inactive Test Product');
    await expect(page.getByTestId('product-option-FG-INACTIVE-PROD')).toHaveCount(0);
    await expect(page.getByText(/No products found|No results found/i)).toBeVisible();

    // 3. Search for wrong-company product
    await pickerInput.fill('Other Company Product');
    await expect(page.getByTestId('product-option-FG-OTHER-COMPANY')).toHaveCount(0);
    await expect(page.getByText(/No products found|No results found/i)).toBeVisible();

    // Select product.
    await pickerInput.fill('Ready Mix Concrete M30');

    const productOption = page.getByTestId(
      'product-option-FG-RMC-M30',
    );

    await expect(productOption).toBeVisible();
    await productOption.click();

    const selectedProduct = page.getByTestId('selected-product');

    await expect(selectedProduct).toBeVisible();
    await expect(selectedProduct).toContainText(
      'Ready Mix Concrete M30',
    );
    await expect(selectedProduct).toHaveAttribute(
      'data-product-code',
      'FG-RMC-M30',
    );

    // Fill required Lead fields using stable test IDs.
    await page
      .getByTestId('lead-project-name')
      .fill(`Browser Project ${suffix}`);

    await page.getByTestId('lead-group-name').fill('Browser Test Group');

    await page
      .getByTestId('lead-company-name')
      .fill(testCompanyName);

    await page
      .getByTestId('lead-contact-person')
      .fill('Mr Test');

    await page
      .getByTestId('lead-phone')
      .fill('9876543210');

    await page
      .getByTestId('lead-address')
      .fill('Browser Test Address');

    await page
      .getByTestId('lead-city')
      .fill('Haridwar');

    await page
      .getByTestId('lead-state')
      .fill('Uttarakhand');

    await page
      .getByTestId('lead-pincode')
      .fill('249401');

    await page
      .getByTestId('lead-specifications')
      .fill('Browser product verification');

    await page
      .getByTestId('lead-estimated-quantity')
      .fill('50');

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/leads'),
    );

    await page.getByTestId('lead-submit').click();

    const createResponse = await createResponsePromise;

    expect(
      createResponse.ok(),
      `Lead API returned ${createResponse.status()}: ${await createResponse.text()}`,
    ).toBeTruthy();

    await expect(page).toHaveURL(/\/sales\/leads/);

    const { getPrismaClient } = require('../sales-order/helpers/test-setup');
    const prisma = getPrismaClient();

    const lead = await prisma.lead.findFirst({
      where: {
        companyName: testCompanyName,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    expect(lead).not.toBeNull();

    const productRecord = await prisma.product.findUnique({ where: { publicId: 'FG-RMC-M30' } });
    expect(productRecord).toBeDefined();

    interface LeadDetailedItem {
      productId?: string;
      productPublicId?: string;
      productCode?: string;
      productName?: string;
    }

    const detailedItems: LeadDetailedItem[] = Array.isArray(lead?.detailedItems)
      ? (lead?.detailedItems as LeadDetailedItem[])
      : [];

    const isIdMatched = detailedItems.some(
      (item) =>
        item.productId === productRecord?.id ||
        item.productPublicId === 'FG-RMC-M30' ||
        item.productCode === 'FG-RMC-M30',
    );

    const productInterestMatched = String(
      lead?.productInterest ?? '',
    )
      .toLowerCase()
      .includes('rmc m30');

    expect(
      isIdMatched || productInterestMatched,
      'Created Lead did not preserve the selected RMC M30 product',
    ).toBeTruthy();

    // Verify created lead remains after browser refresh
    await page.goto('/sales/leads');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(testCompanyName).first()).toBeVisible({ timeout: 15000 });
  });
});

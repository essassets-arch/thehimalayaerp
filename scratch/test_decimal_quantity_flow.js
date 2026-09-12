const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\fd8f5c2d-4532-408a-9e9c-fc3dbcd6f05a';

async function checkDb() {
  const lead = await prisma.lead.findFirst({
    where: { companyName: 'Decimal Test Infrastructure Ltd' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      leadNumber: true,
      companyName: true,
      estimatedQuantity: true,
      detailedItems: true,
    }
  });

  const quotation = await prisma.quotation.findFirst({
    where: { leadId: lead?.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      quotationNumber: true,
      lead: { select: { companyName: true } },
      subtotal: true,
      tax: true,
      total: true,
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        }
      }
    }
  });

  return { lead, quotation, quotationItems: quotation?.items || [] };
}

(async () => {
  console.log('=== STARTING COMPLETE DECIMAL QUANTITY E2E TEST ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868, accuracy: 20 },
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  // 1. LOGIN
  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  const allowBtn = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  // 2. CREATE LEAD WITH DECIMALS
  console.log('\n2. Testing /sales/create-lead with decimal quantities: 1.8, 2.5, 1.25...');
  await page.goto('http://localhost:3000/sales/create-lead');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  // Basic Information
  await page.fill('[data-testid="lead-project-name"]', 'Decimal Infrastructure Project');
  await page.fill('[data-testid="lead-group-name"]', 'Decimal Group');
  await page.fill('[data-testid="lead-company-name"]', 'Decimal Test Infrastructure Ltd');
  await page.fill('[data-testid="lead-contact-person"]', 'Rahul Sharma');
  await page.fill('[data-testid="lead-phone"]', '9876543210');

  // Address
  await page.fill('[data-testid="lead-address"]', 'Plot 42, Industrial Area');
  await page.fill('[data-testid="lead-city"]', 'Ahmedabad');
  await page.fill('[data-testid="lead-state"]', 'Gujarat');
  await page.fill('[data-testid="lead-pincode"]', '380001');

  // Pick Catalog Product for Item 1
  console.log('Selecting Catalog Product for Item 1...');
  await page.locator('input[placeholder="Search product..."]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.product-picker-dropdown [data-testid^="product-option-"]').first().click();
  await page.waitForTimeout(300);

  // Fill Item 1: Qty 1.8, Unit Price 100
  await page.locator('[data-testid="lead-specifications"]').first().fill('Product A Spec (1.8 Qty)');
  const leadQty1 = page.locator('[data-testid="lead-estimated-quantity"]').first();
  await leadQty1.fill('');
  await leadQty1.type('1.8');
  const leadPrice1 = page.locator('[data-testid="lead-unit-price"]').first();
  await leadPrice1.fill('');
  await leadPrice1.type('100');
  await page.waitForTimeout(300);

  // Add Item 2
  console.log('Adding Item 2...');
  await page.click('button:has-text("Add Another Product")');
  await page.waitForTimeout(500);

  await page.locator('input[placeholder="Search product..."]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.product-picker-dropdown [data-testid^="product-option-"]').nth(1).click();
  await page.waitForTimeout(300);

  await page.locator('[data-testid="lead-specifications"]').nth(1).fill('Product B Spec (2.5 Qty)');
  const leadQty2 = page.locator('[data-testid="lead-estimated-quantity"]').nth(1);
  await leadQty2.fill('');
  await leadQty2.type('2.5');
  const leadPrice2 = page.locator('[data-testid="lead-unit-price"]').nth(1);
  await leadPrice2.fill('');
  await leadPrice2.type('200');
  await page.waitForTimeout(300);

  // Add Item 3
  console.log('Adding Item 3...');
  await page.click('button:has-text("Add Another Product")');
  await page.waitForTimeout(500);

  await page.locator('input[placeholder="Search product..."]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.product-picker-dropdown [data-testid^="product-option-"]').nth(2).click();
  await page.waitForTimeout(300);

  await page.locator('[data-testid="lead-specifications"]').nth(2).fill('Product C Spec (1.25 Qty)');
  const leadQty3 = page.locator('[data-testid="lead-estimated-quantity"]').nth(2);
  await leadQty3.fill('');
  await leadQty3.type('1.25');
  const leadPrice3 = page.locator('[data-testid="lead-unit-price"]').nth(2);
  await leadPrice3.fill('');
  await leadPrice3.type('100');
  await page.waitForTimeout(500);

  // Take screenshot of Create Lead form
  const leadShotPath = path.join(artifactDir, 'create_lead_decimal_calculation.png');
  await page.screenshot({ path: leadShotPath, fullPage: true });
  console.log(`Saved screenshot: ${leadShotPath}`);

  // Check UI Totals
  const leadPageContent = await page.content();
  console.log('Lead UI Checks:');
  console.log('  Subtotal ₹805 present:', leadPageContent.includes('805'));
  console.log('  GST ₹144.90 present:', leadPageContent.includes('144.90'));

  // Submit Lead
  console.log('Submitting Lead Details...');
  await page.click('[data-testid="lead-submit"]');
  await page.waitForTimeout(3000);

  // Check if duplicate dialog appeared
  const confirmBtn = page.locator('button:has-text("Create Anyway")');
  if (await confirmBtn.count() > 0 && await confirmBtn.isVisible()) {
    console.log('Confirming duplicate lead creation...');
    await confirmBtn.click();
    await page.waitForTimeout(3000);
  }

  // Retrieve created Lead from DB
  const latestLead = await prisma.lead.findFirst({
    where: { companyName: 'Decimal Test Infrastructure Ltd' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Retrieved created Lead ID from DB: ${latestLead?.id}`);

  // 3. CREATE QUOTATION WITH DECIMALS
  console.log('\n3. Testing /sales/quotations/create with decimal quantities...');
  const quoteUrl = latestLead?.id
    ? `http://localhost:3000/sales/quotations/create?leadId=${latestLead.id}`
    : 'http://localhost:3000/sales/quotations/create';
  await page.goto(quoteUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  page.on('dialog', async dialog => {
    console.log('BROWSER ALERT/DIALOG:', dialog.message());
    await dialog.accept().catch(() => {});
  });

  // Set GST Registered: NO
  await page.selectOption('[data-testid="quotation-gst-registered"]', 'NO');
  await page.waitForTimeout(300);

  // Set Transport Cost: 0
  await page.fill('[data-testid="quotation-transport-charge"]', '0');

  // Check existing items in Quotation form and remove any extra ones beyond 1
  console.log('Preparing Quotation items...');
  while (await page.locator('td[data-label="Action"] button:not([disabled])').count() > 0 && await page.locator('td[data-label="Quantity"]').count() > 1) {
    await page.locator('td[data-label="Action"] button:not([disabled])').first().click();
    await page.waitForTimeout(200);
  }

  // Item 1 in Quotation: Qty 1.8, Price 100
  console.log('Filling Quotation Item 1: Qty 1.8, Price 100...');
  await page.locator('input[placeholder*="Specifications / Color" i]').first().fill('Product A Spec (1.8 Qty)');
  const qQty1 = page.locator('td[data-label="Quantity"] input').first();
  await qQty1.fill('');
  await qQty1.type('1.8');
  const qPrice1 = page.locator('td[data-label="Unit Price"] input').first();
  await qPrice1.fill('');
  await qPrice1.type('100');
  await page.waitForTimeout(300);

  // Item 2 in Quotation: Qty 2.5, Price 200
  console.log('Adding Quotation Item 2: Qty 2.5, Price 200...');
  await page.click('[data-testid="quotation-add-item-btn"]');
  await page.waitForTimeout(400);

  // Pick Product for Item 2
  await page.locator('input[placeholder="Search product..."]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.product-picker-dropdown [data-testid^="product-option-"]').nth(1).click();
  await page.waitForTimeout(300);

  await page.locator('input[placeholder*="Specifications / Color" i]').nth(1).fill('Product B Spec (2.5 Qty)');
  const qQty2 = page.locator('td[data-label="Quantity"] input').nth(1);
  await qQty2.fill('');
  await qQty2.type('2.5');
  const qPrice2 = page.locator('td[data-label="Unit Price"] input').nth(1);
  await qPrice2.fill('');
  await qPrice2.type('200');
  await page.waitForTimeout(300);

  // Item 3 in Quotation: Qty 1.25, Price 100
  console.log('Adding Quotation Item 3: Qty 1.25, Price 100...');
  await page.click('[data-testid="quotation-add-item-btn"]');
  await page.waitForTimeout(400);

  // Pick Product for Item 3
  await page.locator('input[placeholder="Search product..."]').first().click();
  await page.waitForTimeout(500);
  await page.locator('.product-picker-dropdown [data-testid^="product-option-"]').nth(2).click();
  await page.waitForTimeout(300);

  await page.locator('input[placeholder*="Specifications / Color" i]').nth(2).fill('Product C Spec (1.25 Qty)');
  const qQty3 = page.locator('td[data-label="Quantity"] input').nth(2);
  await qQty3.fill('');
  await qQty3.type('1.25');
  const qPrice3 = page.locator('td[data-label="Unit Price"] input').nth(2);
  await qPrice3.fill('');
  await qPrice3.type('100');
  await page.waitForTimeout(500);

  // Take screenshot of Create Quotation form
  const quoteShotPath = path.join(artifactDir, 'create_quotation_decimal_calculation.png');
  await page.screenshot({ path: quoteShotPath, fullPage: true });
  console.log(`Saved screenshot: ${quoteShotPath}`);

  // Check calculated values in Quotation DOM
  const quotePageContent = await page.content();
  console.log('Quotation UI Calculation Checks:');
  console.log('  Items Subtotal ₹805 present:', quotePageContent.includes('805'));
  console.log('  GST 18% ₹144.90 present:', quotePageContent.includes('144.90') || quotePageContent.includes('144.9'));
  console.log('  Grand Total ₹949.90 present:', quotePageContent.includes('949.90') || quotePageContent.includes('949.9'));

  // Submit Quotation
  console.log('Submitting Quotation form...');
  await page.click('[data-testid="quotation-submit"]');
  await page.waitForTimeout(4000);

  await browser.close();

  // 4. VERIFY DATABASE
  console.log('\n4. Verifying PostgreSQL database records in himalaya_erp...');
  const dbData = await checkDb();
  console.log('--- DATABASE LEAD RECORD ---');
  if (dbData.lead) {
    console.log('  ID:', dbData.lead.id);
    console.log('  Lead Number:', dbData.lead.leadNumber);
    console.log('  Company:', dbData.lead.companyName);
    console.log('  estimatedQuantity:', String(dbData.lead.estimatedQuantity));
    console.log('  detailedItems:');
    (dbData.lead.detailedItems || []).forEach((it, idx) => {
      console.log(`    Item ${idx + 1}: ${it.productName || it.name}, qty: ${it.quantity}, price: ${it.unitPrice}`);
    });
  } else {
    console.log('  Lead record not found in DB.');
  }

  console.log('--- DATABASE QUOTATION RECORD ---');
  if (dbData.quotation) {
    console.log('  ID:', dbData.quotation.id);
    console.log('  quotationNumber:', dbData.quotation.quotationNumber);
    console.log('  Lead Company:', dbData.quotation.lead?.companyName);
    console.log('  subtotal:', String(dbData.quotation.subtotal));
    console.log('  tax:', String(dbData.quotation.tax));
    console.log('  total:', String(dbData.quotation.total));
    console.log('  Items:');
    dbData.quotationItems.forEach((it, idx) => {
      console.log(`    Item ${idx + 1}: quantity = ${String(it.quantity)}, unitPrice = ${String(it.unitPrice)}, lineTotal = ${String(it.lineTotal)}`);
    });
  } else {
    console.log('  Quotation record not found in DB.');
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
  await prisma.$disconnect();
})();

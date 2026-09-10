const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 },
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });

  // Navigate to Store Verify Delivery
  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const verifyTabBtn = page.locator('button:has-text("Verify Delivery")').first();
  if (await verifyTabBtn.isVisible()) {
    await verifyTabBtn.click();
    await page.waitForTimeout(1500);
  }

  // Click on first PO card
  const firstCard = page.locator('.delivery-po-card').first();
  await firstCard.click();
  await page.waitForTimeout(1500);

  // Click Auto-Fill
  const autoFillBtn = page.locator('button:has-text("Auto-Fill Full Delivery")').first();
  await autoFillBtn.click();
  await page.waitForTimeout(500);

  // Fill Challan and Vehicle
  const challanInput = page.locator('input[placeholder*="DC-"]').first();
  if (await challanInput.isVisible()) {
    await challanInput.fill('DC-2026-9841');
  }

  const vehicleInput = page.locator('input[placeholder*="MH-"]').first();
  if (await vehicleInput.isVisible()) {
    await vehicleInput.fill('MH-12-AB-9988');
  }

  // Scroll down to the gate and summary area
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const shotBottom = path.join(artifactDir, 'redesigned_store_delivery_bottom_details.png');
  await page.screenshot({ path: shotBottom });
  console.log(`Captured bottom details: ${shotBottom}`);

  await browser.close();
})().catch(console.error);

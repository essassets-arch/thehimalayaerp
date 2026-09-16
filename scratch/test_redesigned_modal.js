const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 23.0225, longitude: 72.5714 },
  });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    } catch (e) {}
  });

  const page = await context.newPage();

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Opening Sales Complaints page...');
  await page.goto('http://localhost:3000/sales/customer-complaints');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Clicking + Create Complaint...');
  const createBtn = page.locator('button:has-text("+ Create Complaint")');
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Search and select customer DAKSH BUILDCON
  console.log('Searching customer...');
  const searchInput = page.locator('input[data-testid="smart-search-complaint-customer"]');
  await searchInput.fill('daksh');
  await page.waitForTimeout(600);

  const custOption = page.locator('[data-cust-item]:has-text("DAKSH")').first();
  if (await custOption.isVisible()) {
    console.log('Selecting DAKSH customer...');
    await custOption.click();
  } else {
    console.log('Selecting first available customer...');
    const firstCust = page.locator('[data-cust-item]').first();
    if (await firstCust.isVisible()) {
      await firstCust.click();
    }
  }
  await page.waitForTimeout(1000);

  // If order select has options, ensure an order is selected
  const orderSelect = page.locator('select[data-testid="select-complaint-order"]');
  const selectedOrderVal = await orderSelect.inputValue();
  if (!selectedOrderVal) {
    const opts = await orderSelect.locator('option').all();
    if (opts.length > 1) {
      const val = await opts[1].getAttribute('value');
      if (val) {
        await orderSelect.selectOption(val);
      }
    }
  }
  await page.waitForTimeout(1000);

  // Click Complaint Type chip 'Wrong Product'
  const wrongProductChip = page.locator('button:has-text("Wrong Product")').first();
  if (await wrongProductChip.isVisible()) {
    await wrongProductChip.click();
  }

  // Click Priority 'Critical'
  const criticalChip = page.locator('button:has-text("Critical")').first();
  if (await criticalChip.isVisible()) {
    await criticalChip.click();
  }

  await page.waitForTimeout(800);

  const shotPath = path.join(artifactDir, 'redesigned_create_complaint_modal.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  // Scroll modal body to bottom
  await page.evaluate(() => {
    const modalBody = document.querySelector('.complaint-modal > div:nth-child(2)');
    if (modalBody) modalBody.scrollTop = modalBody.scrollHeight;
  });
  await page.waitForTimeout(1000);

  const shotPathScrolled = path.join(artifactDir, 'redesigned_create_complaint_modal_scrolled.png');
  await page.screenshot({ path: shotPathScrolled });
  console.log('Saved scrolled screenshot:', shotPathScrolled);

  await browser.close();
})();

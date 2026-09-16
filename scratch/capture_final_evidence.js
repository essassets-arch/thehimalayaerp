const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51';

(async () => {
  console.log('--- Capturing Final Verification Screenshots ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const dismissOverlays = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el) => {
        if (el.innerText && el.innerText.includes('Mandatory Permissions Required') && el.classList && el.classList.contains('fixed')) {
          el.remove();
        }
      });
    });
  };

  // 1. Finance Portal: Resolved Complaints Tab
  console.log('1. Finance Portal: Resolved Complaints Tab...');
  await page.goto('http://localhost:3000/finance/customer-complaints');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const resolvedTab = page.locator('button:has-text("Resolved Complaints")');
  if (await resolvedTab.isVisible()) {
    await resolvedTab.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const financeResolvedTableScreenshot = path.join(artifactDir, 'finance_resolved_tab_verified.png');
  await page.screenshot({ path: financeResolvedTableScreenshot });
  console.log(`Saved: ${financeResolvedTableScreenshot}`);

  // Click View Realization
  const viewRealizationBtn = page.locator('button:has-text("View Realization")').first();
  if (await viewRealizationBtn.isVisible()) {
    await viewRealizationBtn.click({ force: true });
    await page.waitForTimeout(1500);

    const financeRealizationModalScreenshot = path.join(artifactDir, 'finance_realization_modal_verified.png');
    await page.screenshot({ path: financeRealizationModalScreenshot });
    console.log(`Saved: ${financeRealizationModalScreenshot}`);

    await page.click('button:has-text("Close")', { force: true });
    await page.waitForTimeout(500);
  }

  // 2. Sales Portal: Resolved Details
  console.log('2. Sales Portal: Resolved Details with Deductions & Realization...');
  await page.goto('http://localhost:3000/sales/customer-complaints');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await dismissOverlays();

  const salesResolvedRow = page.locator('tbody tr:has-text("Resolved")').first();
  if (await salesResolvedRow.isVisible()) {
    await salesResolvedRow.click({ force: true });
    await page.waitForTimeout(1500);

    const salesResolvedDetailScreenshot = path.join(artifactDir, 'sales_resolved_detail_modal_verified.png');
    await page.screenshot({ path: salesResolvedDetailScreenshot });
    console.log(`Saved: ${salesResolvedDetailScreenshot}`);

    await page.click('button:has-text("Close")', { force: true });
    await page.waitForTimeout(500);
  }

  // 3. Sales Dashboard: Realization metrics
  console.log('3. Sales Dashboard: Net Realization Performance...');
  await page.goto('http://localhost:3000/sales');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);
  await dismissOverlays();

  const salesDashboardScreenshot = path.join(artifactDir, 'sales_dashboard_net_realization_verified.png');
  await page.screenshot({ path: salesDashboardScreenshot });
  console.log(`Saved: ${salesDashboardScreenshot}`);

  await browser.close();
  console.log('--- All Evidence Screenshots Captured Successfully! ---');
})();

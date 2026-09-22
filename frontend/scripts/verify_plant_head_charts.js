const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyPlantHeadCharts() {
  console.log('--- Starting Playwright Chart & Dashboard Audit ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['geolocation', 'notifications'],
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  console.log('1. Logging in...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'plant.head@himalayaerp.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);

  if (!page.url().includes('/plant-head/dashboard')) {
    console.log('2. Navigating explicitly to /plant-head/dashboard...');
    await page.goto('http://localhost:3002/plant-head/dashboard', { waitUntil: 'networkidle' });
  }

  await page.waitForSelector('text=/Plant Head Manufacturing Command Center/i', { timeout: 15000 });
  console.log('✓ Reached Plant Head Command Center');

  // Wait for data load and charts hydration
  await page.waitForTimeout(3500);

  // Measure all SVGs
  const svgs = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.recharts-responsive-container svg.recharts-surface'));
    return list.map((s, i) => {
      const r = s.getBoundingClientRect();
      return {
        index: i,
        width: Math.round(r.width),
        height: Math.round(r.height),
        paths: s.querySelectorAll('path, rect, circle').length
      };
    });
  });
  console.log('Active Chart SVGs:', JSON.stringify(svgs, null, 2));

  const allHaveWidth = svgs.every(s => s.width > 100);
  console.log('All Chart SVGs have non-zero width (> 100px):', allHaveWidth ? '✓ PASS' : '✗ FAIL');

  const artifactsDir = 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/e99640ef-5d15-428b-8272-7dec1848cb58';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // 1. Screenshot Top (Row 1 KPIs + Row 2 Analytics Widgets)
  await page.evaluate(() => {
    const s = document.querySelector('.main-viewport') || window;
    s.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  const row2Path = path.join(artifactsDir, 'plant_head_dashboard_row2.png');
  await page.screenshot({ path: row2Path });
  console.log(`✓ Saved Row 2 Analytics screenshot to: ${row2Path}`);

  // 2. Screenshot Row 3 (Breakdown Charts)
  await page.evaluate(() => {
    const s = document.querySelector('.main-viewport') || window;
    s.scrollTo({ top: 650, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  const row3Path = path.join(artifactsDir, 'plant_head_dashboard_row3.png');
  await page.screenshot({ path: row3Path });
  console.log(`✓ Saved Row 3 Breakdown screenshot to: ${row3Path}`);

  // 3. Switch QC to Chart mode and screenshot Row 4
  const qcChartBtn = page.locator('button:has-text("Chart")').nth(4);
  if (await qcChartBtn.isVisible()) {
    await qcChartBtn.click();
    await page.waitForTimeout(600);
    console.log('✓ Switched Quality Control to Chart view');
  }

  await page.evaluate(() => {
    const s = document.querySelector('.main-viewport') || window;
    s.scrollTo({ top: 1100, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  const row4Path = path.join(artifactsDir, 'plant_head_dashboard_row4.png');
  await page.screenshot({ path: row4Path });
  console.log(`✓ Saved Row 4 QC & Operations screenshot to: ${row4Path}`);

  // Full page screenshot
  const fullPath = path.join(artifactsDir, 'plant_head_dashboard_full.png');
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log(`✓ Saved Full Page screenshot to: ${fullPath}`);

  await browser.close();
  console.log('\n=== VERIFICATION AUDIT COMPLETE ===');
}

verifyPlantHeadCharts().catch(err => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});

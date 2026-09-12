const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const tdStyles = await page.evaluate(() => {
    const td = document.querySelector('.pd-nested-table td');
    const tr = document.querySelector('.pd-nested-table tbody tr');
    const thead = document.querySelector('.pd-nested-table thead');
    const table = document.querySelector('.pd-nested-table');
    return {
      table: table ? { display: getComputedStyle(table).display } : null,
      thead: thead ? { display: getComputedStyle(thead).display } : null,
      tr: tr ? { display: getComputedStyle(tr).display, flexDirection: getComputedStyle(tr).flexDirection } : null,
      td: td ? { display: getComputedStyle(td).display, textAlign: getComputedStyle(td).textAlign } : null,
    };
  });
  console.log('Computed styles:', tdStyles);
  await browser.close();
}
main().catch(console.error);

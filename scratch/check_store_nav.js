const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'Store@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button')).map(el => ({ text: el.innerText.trim(), href: el.href })).filter(x => x.text);
  });
  console.log('Store navigation items (filtered):', links.filter(l => 
    l.text.toLowerCase().includes('indent') || 
    l.text.toLowerCase().includes('history') || 
    l.text.toLowerCase().includes('purchase') ||
    l.text.toLowerCase().includes('material') ||
    l.text.toLowerCase().includes('store')
  ));
  console.log('All tabs/buttons in header/nav:', links.slice(0, 30));
  await browser.close();
})();

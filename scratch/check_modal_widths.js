const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });

  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const box = document.querySelector('.modal-box');
    const table = box ? box.querySelector('table') : null;
    const ths = table ? Array.from(table.querySelectorAll('th')).map(t => ({ text: t.innerText.trim(), width: t.getBoundingClientRect().width })) : [];
    const container = table ? table.parentElement : null;
    return {
      boxWidth: box ? box.getBoundingClientRect().width : 0,
      containerWidth: container ? container.getBoundingClientRect().width : 0,
      containerScrollWidth: container ? container.scrollWidth : 0,
      tableWidth: table ? table.getBoundingClientRect().width : 0,
      ths
    };
  });

  console.log('Modal element info:', JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);

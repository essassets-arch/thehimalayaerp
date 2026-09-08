const { chromium } = require('playwright');
(async () => {
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
  
  page.on('request', req => {
    if (req.url().includes('indent') || req.url().includes('procurement')) {
      console.log('Request URL:', req.url(), 'Method:', req.method(), 'PostData:', req.postData());
    }
  });

  page.on('response', async res => {
    if (res.url().includes('indent') || res.url().includes('procurement')) {
      console.log('Response URL:', res.url(), 'Status:', res.status());
      try {
        console.log('Body:', await res.text());
      } catch (e) {}
    }
  });

  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.text());
  });

  await page.click('button:has-text("Submit Indent")');
  await page.waitForTimeout(3000);

  const swalInfo = await page.evaluate(() => {
    const title = document.querySelector('.swal2-title, .swal-premium-title')?.textContent;
    const text = document.querySelector('.swal2-html-container, .swal2-content, .swal-premium-text')?.textContent;
    return { title, text };
  });
  console.log('Swal Info:', swalInfo);
  await browser.close();
})();

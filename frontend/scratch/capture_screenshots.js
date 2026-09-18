const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const ARTIFACTS_DIR = 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/6b1c8378-fd6a-427c-9500-780933748862';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Browser Context (1440 x 900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await desktopContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const desktopPage = await desktopContext.newPage();

  // Login
  console.log('Logging in on desktop...');
  await desktopPage.goto(`${BASE_URL}/login`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.getByTestId('login-email').fill('backoffice@himalayaerp.com');
  await desktopPage.getByTestId('login-password').fill('ARHIMALAYA12');
  await desktopPage.getByTestId('login-submit').click();
  await desktopPage.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });

  // Sample Tracker Desktop
  console.log('Capturing sample-tracker desktop...');
  await desktopPage.goto(`${BASE_URL}/back-office/sample-tracker`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'sample_tracker_desktop.png'),
    fullPage: false,
  });

  // Outward Register Desktop
  console.log('Capturing outward-register desktop...');
  await desktopPage.goto(`${BASE_URL}/back-office/outward-register`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'outward_register_desktop.png'),
    fullPage: false,
  });

  // Payment Follow Ups Desktop
  console.log('Capturing payment-follow-ups desktop...');
  await desktopPage.goto(`${BASE_URL}/back-office/payment-follow-ups`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'payment_follow_ups_desktop.png'),
    fullPage: false,
  });

  await desktopContext.close();

  // 2. Mobile Browser Context (390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobileContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const mobilePage = await mobileContext.newPage();

  // Login
  console.log('Logging in on mobile...');
  await mobilePage.goto(`${BASE_URL}/login`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.getByTestId('login-email').fill('backoffice@himalayaerp.com');
  await mobilePage.getByTestId('login-password').fill('ARHIMALAYA12');
  await mobilePage.getByTestId('login-submit').click();
  await mobilePage.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });

  // Sample Tracker Mobile
  console.log('Capturing sample-tracker mobile...');
  await mobilePage.goto(`${BASE_URL}/back-office/sample-tracker`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'sample_tracker_mobile.png'),
    fullPage: false,
  });

  // Outward Register Mobile
  console.log('Capturing outward-register mobile...');
  await mobilePage.goto(`${BASE_URL}/back-office/outward-register`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'outward_register_mobile.png'),
    fullPage: false,
  });

  // Payment Follow Ups Mobile
  console.log('Capturing payment-follow-ups mobile...');
  await mobilePage.goto(`${BASE_URL}/back-office/payment-follow-ups`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'payment_follow_ups_mobile.png'),
    fullPage: false,
  });

  await mobileContext.close();
  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});

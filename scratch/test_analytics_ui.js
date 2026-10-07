const { chromium } = require('playwright');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Testing Plant Head Production Analytics UI with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Generate token for Plant Head user
  const user = await prisma.user.findFirst({
    where: { role: { name: 'Plant Head' } },
    include: { role: true }
  });

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role.name,
    companyId: user.companyId
  }, secret, { expiresIn: '1h' });

  await context.addCookies([
    { name: 'accessToken', value: token, domain: 'localhost', path: '/' },
    { name: 'token', value: token, domain: 'localhost', path: '/' },
    { name: 'himalaya_token', value: token, domain: 'localhost', path: '/' },
    { name: 'role', value: 'Plant Head', domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();

  await page.addInitScript((t) => {
    localStorage.setItem('accessToken', t);
    localStorage.setItem('token', t);
    localStorage.setItem('himalaya_token', t);
    sessionStorage.setItem('himalaya_token', t);
    localStorage.setItem('role', 'Plant Head');
    localStorage.setItem('user', JSON.stringify({ role: 'Plant Head', email: 'plant.head@himalayaerp.com' }));
    sessionStorage.setItem('user', JSON.stringify({ role: 'Plant Head', email: 'plant.head@himalayaerp.com' }));
  }, token);

  console.log('Navigating to http://localhost:3002/plant-head/production-analytics...');
  await page.goto('http://localhost:3002/plant-head/production-analytics', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Verify Header & Filter Bar
  const title = await page.textContent('h1');
  console.log('Page H1:', title);

  const filterBar = await page.locator('.report-filter-bar').count();
  console.log('Filter bar count:', filterBar);

  // 2. Check Quick Month Buttons
  const monthBtns = await page.locator('.report-filter-bar button').allTextContents();
  console.log('Quick Filter buttons:', monthBtns);

  // 3. Check Filter Selects
  const selects = await page.locator('.report-filter-bar select').count();
  console.log('Filter selects count:', selects);

  // 4. Check KPI Cards
  const kpis = await page.locator('.report-kpi-grid > div').allTextContents();
  console.log('\n--- KPI Cards ---');
  kpis.forEach((k, idx) => console.log(`Card ${idx + 1}: ${k.replace(/\s+/g, ' ').slice(0, 70)}...`));

  // 5. Check Category Badges on Product Showcase Cards
  const categoryBadges = await page.locator('.report-products-grid span').filter({ hasText: 'Category:' }).allTextContents();
  console.log('\n--- Product Showcase Category Badges ---');
  console.log('Found category badges:', categoryBadges.length);
  if (categoryBadges.length > 0) {
    console.log('Sample badge:', categoryBadges[0]);
  }

  // 6. Test Quick Switch to August 2026
  console.log('\nClicking Aug 2026 quick button...');
  const augBtn = page.locator('button', { hasText: 'Aug 2026' });
  if (await augBtn.count() > 0) {
    await augBtn.first().click();
    await page.waitForTimeout(2000);
    const augWeight = await page.locator('.report-kpi-grid > div').first().textContent();
    console.log('August KPI Card 1:', augWeight.replace(/\s+/g, ' '));
  }

  // 7. Test Quick Switch to September 2026
  console.log('\nClicking Sep 2026 quick button...');
  const sepBtn = page.locator('button', { hasText: 'Sep 2026' });
  if (await sepBtn.count() > 0) {
    await sepBtn.first().click();
    await page.waitForTimeout(2000);
    const sepWeight = await page.locator('.report-kpi-grid > div').first().textContent();
    console.log('September KPI Card 1:', sepWeight.replace(/\s+/g, ' '));
  }

  // Take screenshot
  await page.screenshot({ path: 'scratch/production_analytics_verified.png', fullPage: false });
  console.log('\nScreenshot saved to scratch/production_analytics_verified.png');

  await browser.close();
  await prisma.$disconnect();
}

run().catch(console.error);

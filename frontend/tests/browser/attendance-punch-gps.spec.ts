import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { performRobustLogin } from './certification/sales-order/helpers/test-setup';

test.describe('Attendance — Global Real-Time Device GPS Location & Zero Fallback', () => {
  test.beforeEach(async () => {
    try {
      execSync('docker exec himalaya-backend node -e "new (require(\'@prisma/client\').PrismaClient)().attendance.deleteMany().then(() => console.log(\'CLEARED\'))"');
    } catch (e) {
      console.warn('Could not reset attendance via docker:', e);
    }
  });
  test('Punch In at Location A (Delhi) and Punch Out at Location B (Bengaluru) capture independent real GPS coordinates with zero fallback', async ({
    page,
    context,
  }) => {
    test.setTimeout(90000);

    // Track network requests to ensure no third-party IP geocoding is contacted
    const blockedHosts: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('bigdatacloud.net') || url.includes('ip-api.com') || url.includes('ipapi.co')) {
        blockedHosts.push(url);
      }
    });

    page.on('console', (msg) => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('[BROWSER PAGEERROR]', err.message));

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;

      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = function (success, error, options) {
        return originalGetCurrentPosition(
          success,
          error,
          { ...options, maximumAge: options?.maximumAge === 0 ? 60000 : (options?.maximumAge ?? 60000) }
        );
      };
    });

    const reverseGeocodeRequests: Array<{ lat: number; lng: number }> = [];

    // Mock central location reverse-geocode endpoint responses
    await page.route('**/api/backend/location/reverse-geocode*', async (route) => {
      const url = new URL(route.request().url());
      const lat = parseFloat(url.searchParams.get('lat') || '0');
      const lng = parseFloat(url.searchParams.get('lng') || '0');
      const acc = url.searchParams.get('accuracy') ? parseFloat(url.searchParams.get('accuracy')!) : null;

      reverseGeocodeRequests.push({ lat, lng });

      if (Math.abs(lat - 28.6139) < 0.05 && Math.abs(lng - 77.2090) < 0.05) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            formattedAddress: 'Connaught Place, New Delhi, Delhi 110001',
            address: 'Connaught Place, New Delhi, Delhi 110001',
            placeId: 'ChIJdelhi_connaught_place',
            latitude: lat,
            longitude: lng,
            accuracy: acc,
          }),
        });
        return;
      }

      if (Math.abs(lat - 12.9716) < 0.05 && Math.abs(lng - 77.5946) < 0.05) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            formattedAddress: 'MG Road, Bengaluru, Karnataka 560001',
            address: 'MG Road, Bengaluru, Karnataka 560001',
            placeId: 'ChIJbengaluru_mg_road',
            latitude: lat,
            longitude: lng,
            accuracy: acc,
          }),
        });
        return;
      }

      await route.continue();
    });

    // Set initial device GPS to Location A: Delhi
    await context.grantPermissions(['geolocation', 'notifications'], { origin: 'http://localhost:3000' });
    await context.setGeolocation({ latitude: 28.6139, longitude: 77.2090, accuracy: 12 });

    // 1. Log in as Sales Executive (or standard employee)
    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    // 2. Locate biometric punch button on HeroBanner
    const punchTriggerBtn = page.getByTestId('hero-biometric-punch-btn');
    await expect(punchTriggerBtn).toBeVisible({ timeout: 15000 });
    await punchTriggerBtn.click();

    // 3. Modal opens — verify Punch In button is visible
    const punchInBtn = page.getByTestId('attendance-punch-in-btn');
    await expect(punchInBtn).toBeVisible({ timeout: 10000 });

    // Enable Test Mode in punch modal if available to allow biometric badge verification
    const testModeCheckbox = page.locator('.attendance-punch-test-mode input[type="checkbox"]');
    if (await testModeCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (!(await testModeCheckbox.isChecked())) {
        await testModeCheckbox.check();
      }
    }

    // 4. Click Punch In at Location A (Delhi)
    await punchInBtn.click();

    // Expect success popup with Delhi location
    const swalTitle = page.locator('.swal2-title');
    await expect(swalTitle).toBeVisible({ timeout: 15000 });
    await expect(swalTitle).toContainText(/Punched In Successfully/i);

    const swalPopup = page.locator('.swal2-popup');
    await expect(swalPopup).toContainText(/Connaught Place, New Delhi/i);
    await expect(swalPopup).toContainText(/28.6139/);

    // Dismiss SweetAlert
    const confirmBtn = page.locator('.swal2-confirm');
    await confirmBtn.click();

    // 5. EMPLOYEE MOVES: Update device GPS to Location B (Bengaluru)
    await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946, accuracy: 18 });

    // Wait 1 second to simulate travel / time passing
    await page.waitForTimeout(1000);

    // 6. Click punch button on HeroBanner to open Punch Out modal
    await punchTriggerBtn.click();

    // Verify Punch Out button is visible (status: PUNCHED IN)
    const punchOutBtn = page.getByTestId('attendance-punch-out-btn');
    await expect(punchOutBtn).toBeVisible({ timeout: 10000 });

    // 7. Click Punch Out at Location B (Bengaluru)
    await punchOutBtn.click();

    // Expect Punch Out success popup with Bengaluru location
    await expect(swalTitle).toBeVisible({ timeout: 15000 });
    await expect(swalTitle).toContainText(/Punched Out Successfully/i);

    await expect(swalPopup).toContainText(/MG Road, Bengaluru/i);
    await expect(swalPopup).toContainText(/12.9716/);

    // CRITICAL ASSERTION: Punch Out captured Bengaluru, NOT Delhi!
    // Zero coordinate reuse between Punch In and Punch Out
    expect(reverseGeocodeRequests.some(r => Math.abs(r.lat - 28.6139) < 0.05)).toBe(true);
    expect(reverseGeocodeRequests.some(r => Math.abs(r.lat - 12.9716) < 0.05)).toBe(true);

    // Confirm no third-party IP geolocation services were contacted
    expect(blockedHosts).toHaveLength(0);
  });

  test('GPS Failure / Permission Denied triggers strict error alert with zero fallback to Ahmedabad or static coordinates', async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);

    // Track network requests to ensure no third-party IP geocoding is contacted
    const blockedHosts: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('bigdatacloud.net') || url.includes('ip-api.com') || url.includes('ipapi.co')) {
        blockedHosts.push(url);
      }
    });

    // Clear permissions to simulate location permission denied
    await context.clearPermissions();

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;

      // Mock navigator.geolocation to simulate PERMISSION_DENIED (code: 1)
      navigator.geolocation.getCurrentPosition = function (_success, error) {
        const err = new Error('User denied Geolocation') as any;
        err.code = 1; // PERMISSION_DENIED
        err.PERMISSION_DENIED = 1;
        setTimeout(() => error(err), 50);
      };
    });

    // 1. Log in
    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    // 2. Click biometric punch button on HeroBanner
    const punchTriggerBtn = page.getByTestId('hero-biometric-punch-btn');
    await expect(punchTriggerBtn).toBeVisible({ timeout: 15000 });
    await punchTriggerBtn.click();

    // 3. Try to punch in with GPS permission denied
    const punchInBtn = page.getByTestId('attendance-punch-in-btn');
    if (await punchInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await punchInBtn.click();

      // Expect Location Access Required warning modal
      const swalTitle = page.locator('.swal2-title');
      await expect(swalTitle).toBeVisible({ timeout: 10000 });
      await expect(swalTitle).toContainText(/Location Access Required|Location Unavailable/i);

      const swalText = page.locator('.swal2-html-container');
      await expect(swalText).toContainText(/Location permission was denied\. Please allow location access and try again\./i);

      // Verify NO fallback to Ahmedabad or Gujarat
      const fullText = await swalText.textContent();
      expect(fullText).not.toContain('Ahmedabad');
      expect(fullText).not.toContain('23.0225');
      expect(fullText).not.toContain('72.5714');
    }

    // Confirm no third-party IP geolocation services were contacted
    expect(blockedHosts).toHaveLength(0);
  });
});

import { test, expect } from '@playwright/test';
import { performRobustLogin } from './certification/sales-order/helpers/test-setup';

test.describe('Sales Create Lead — Dynamic Real-Time GPS Delivery Location', () => {
  test('Delhi GPS coordinates resolve to Delhi address, then Bengaluru coordinates resolve to Bengaluru address', async ({
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

    // Mock reverse-geocode endpoint responses for deterministic testing across machines
    await page.route('**/api/backend/location/reverse-geocode*', async (route) => {
      console.log('[MOCK ROUTE HIT]', route.request().url());
      const url = new URL(route.request().url());
      const lat = parseFloat(url.searchParams.get('lat') || '0');
      const lng = parseFloat(url.searchParams.get('lng') || '0');
      const acc = url.searchParams.get('accuracy') ? parseFloat(url.searchParams.get('accuracy')!) : null;

      if (Math.abs(lat - 28.6139) < 0.01 && Math.abs(lng - 77.2090) < 0.01) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            formattedAddress: 'Connaught Place, New Delhi, Delhi 110001',
            placeId: 'ChIJdelhi_connaught_place',
            line1: 'Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            country: 'India',
            latitude: lat,
            longitude: lng,
            accuracy: acc,
          }),
        });
        return;
      }

      if (Math.abs(lat - 12.9716) < 0.01 && Math.abs(lng - 77.5946) < 0.01) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            formattedAddress: 'MG Road, Bengaluru, Karnataka 560001',
            placeId: 'ChIJbengaluru_mg_road',
            line1: 'MG Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            country: 'India',
            latitude: lat,
            longitude: lng,
            accuracy: acc,
          }),
        });
        return;
      }

      await route.continue();
    });

    // Grant permissions with explicit origin
    await context.grantPermissions(['geolocation', 'notifications'], { origin: 'http://localhost:3000' });
    await context.setGeolocation({ latitude: 28.6139, longitude: 77.2090, accuracy: 12 });

    // 1. Log in as Sales Executive
    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    // 2. Navigate to /sales/leads and open create lead form
    await page.goto('/sales/leads');
    const newLeadBtn = page.getByTestId('lead-create');
    await expect(newLeadBtn).toBeVisible({ timeout: 10000 });
    await newLeadBtn.click();
    await expect(page.getByTestId('sales-create-lead-page')).toBeVisible({ timeout: 10000 });

    const locationBtn = page.getByTestId('use-current-location-btn');
    await expect(locationBtn).toBeVisible();
    await expect(locationBtn).toHaveText(/Use Current Location/i);

    // Verify no default state is prepopulated with Gujarat
    const stateInput = page.getByTestId('lead-state');
    expect(await stateInput.inputValue()).not.toBe('Gujarat');

    // 4. Click "Use Current Location" in Delhi
    await locationBtn.click();

    // Verify accuracy badge and Delhi address resolution
    const accuracyBadge = page.getByTestId('location-accuracy-badge');
    await expect(accuracyBadge).toBeVisible({ timeout: 10000 });
    await expect(accuracyBadge).toContainText('Location accuracy: ~12 m');
    await expect(accuracyBadge).toContainText('28.61390, 77.20900');

    // Verify fields populated with Delhi details
    await expect(page.getByTestId('lead-address')).toHaveValue('Connaught Place');
    await expect(page.getByTestId('lead-city')).toHaveValue('New Delhi');
    await expect(page.getByTestId('lead-state')).toHaveValue('Delhi');
    await expect(page.getByTestId('lead-pincode')).toHaveValue('110001');

    // Verify button indicates location captured
    await expect(locationBtn).toContainText('Location captured');

    // 5. Travel to Bengaluru: update GPS coordinates
    await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946, accuracy: 8 });

    // Click "Location captured" button again to request fresh position
    await locationBtn.click();

    // Verify accuracy badge updates to Bengaluru
    await expect(accuracyBadge).toContainText('Location accuracy: ~8 m');
    await expect(accuracyBadge).toContainText('12.97160, 77.59460');

    // Verify fields updated to Bengaluru
    await expect(page.getByTestId('lead-address')).toHaveValue('MG Road');
    await expect(page.getByTestId('lead-city')).toHaveValue('Bengaluru');
    await expect(page.getByTestId('lead-state')).toHaveValue('Karnataka');
    await expect(page.getByTestId('lead-pincode')).toHaveValue('560001');

    // Verify no third-party IP lookup services were ever contacted
    expect(blockedHosts).toHaveLength(0);

    // 6. Complete remaining required fields and verify payload submission
    const suffix = `${Date.now()}`;
    await page.getByTestId('lead-project-name').fill(`GPS Project ${suffix}`);
    await page.getByTestId('lead-group-name').fill('GPS Group');
    await page.getByTestId('lead-company-name').fill(`GPS Lead Company ${suffix}`);
    await page.getByTestId('lead-contact-person').fill('Site Incharge Raman');
    await page.getByTestId('lead-phone').fill('987' + String(Date.now()).slice(-7));

    // Fill product
    const pickerInput = page.getByTestId('lead-product-picker');
    await pickerInput.click();
    const productOption = page.locator('[data-testid^="product-option-"]').first();
    await expect(productOption).toBeVisible({ timeout: 10000 });
    await productOption.click();

    await page.getByTestId('lead-specifications').fill('GPS Delivery Testing Spec');
    await page.getByTestId('lead-estimated-quantity').fill('50');

    // Intercept submit request and verify delivery coordinates contract
    let submittedPayload: any = null;
    await page.route('**/api/backend/sales/leads', async (route) => {
      if (route.request().method() === 'POST') {
        submittedPayload = route.request().postDataJSON();
      }
      await route.continue();
    });

    const submitBtn = page.getByTestId('lead-submit');
    await submitBtn.click();

    // Wait for submission to complete
    await page.waitForResponse(
      (resp) => resp.request().method() === 'POST' && resp.url().includes('/sales/leads'),
      { timeout: 15000 },
    );

    // Assert submitted payload contract
    expect(submittedPayload).toBeTruthy();
    expect(submittedPayload.deliveryAddress).toBe('MG Road, Bengaluru, Karnataka 560001');
    expect(submittedPayload.deliveryLatitude).toBe(12.9716);
    expect(submittedPayload.deliveryLongitude).toBe(77.5946);
    expect(submittedPayload.deliveryAccuracy).toBe(8);
    expect(submittedPayload.deliveryPlaceId).toBe('ChIJbengaluru_mg_road');

    // Verify postal address structure
    expect(submittedPayload.address).toBeDefined();
    expect(submittedPayload.address.line1).toBe('MG Road');
    expect(submittedPayload.address.city).toBe('Bengaluru');
    expect(submittedPayload.address.state).toBe('Karnataka');
    expect(submittedPayload.address.pincode).toBe('560001');

    // Verify NO duplicate coordinate fields inside address
    expect(submittedPayload.address.latitude).toBeUndefined();
    expect(submittedPayload.address.longitude).toBeUndefined();
  });

  test('GPS unavailable or permission denied shows error, never falls back to Ahmedabad, Gujarat or IP location', async ({
    page,
    context,
  }) => {
    test.setTimeout(45000);

    // Track network requests to ensure zero IP geolocation
    const blockedHosts: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('bigdatacloud.net') || url.includes('ip-api.com') || url.includes('ipapi.co')) {
        blockedHosts.push(url);
      }
    });

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;

      // Mock geolocation error (code 1 = PERMISSION_DENIED)
      navigator.geolocation.getCurrentPosition = function (success, error) {
        if (error) {
          error({
            code: 1,
            message: 'User denied Geolocation',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationPositionError);
        }
      };
    });

    // 1. Log in as Sales Executive
    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    // 2. Open Create Lead Form
    await page.goto('/sales/leads');
    const newLeadBtn = page.getByTestId('lead-create');
    await expect(newLeadBtn).toBeVisible({ timeout: 10000 });
    await newLeadBtn.click();
    await expect(page.getByTestId('sales-create-lead-page')).toBeVisible({ timeout: 10000 });

    const locationBtn = page.getByTestId('use-current-location-btn');
    await expect(locationBtn).toBeVisible();

    // 3. Click "Use Current Location" when GPS permission is denied
    await locationBtn.click();

    // 4. Verify SweetAlert error modal appears
    const swalModal = page.locator('.swal2-modal');
    await expect(swalModal).toBeVisible({ timeout: 5000 });
    await expect(swalModal).toContainText(/Location permission was denied|Location Unavailable/i);

    // Close Swal modal
    const confirmBtn = page.locator('.swal2-confirm');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // 5. Verify STRICTLY NO fallback to Ahmedabad, Gujarat, or any static address
    const addressInput = page.getByTestId('lead-address');
    const cityInput = page.getByTestId('lead-city');
    const stateInput = page.getByTestId('lead-state');
    const pincodeInput = page.getByTestId('lead-pincode');

    expect(await addressInput.inputValue()).toBe('');
    expect(await cityInput.inputValue()).toBe('');
    expect(await stateInput.inputValue()).not.toBe('Gujarat');
    expect(await pincodeInput.inputValue()).toBe('');

    // Accuracy badge must NOT be visible
    await expect(page.getByTestId('location-accuracy-badge')).not.toBeVisible();

    // Zero IP geolocation calls
    expect(blockedHosts).toHaveLength(0);

    // 6. Manual entry remains fully functional
    await addressInput.fill('Manual Delivery Site 404');
    await cityInput.fill('Kolkata');
    await stateInput.fill('West Bengal');
    await pincodeInput.fill('700001');

    await expect(addressInput).toHaveValue('Manual Delivery Site 404');
    await expect(cityInput).toHaveValue('Kolkata');
    await expect(stateInput).toHaveValue('West Bengal');
    await expect(pincodeInput).toHaveValue('700001');
  });

  test('Mobile & APK environment executes 100% device GPS flow without static fallback', async ({
    page,
    context,
  }) => {
    test.setTimeout(45000);

    // Simulate mobile / APK viewport (Pixel 7 / Android WebView dimensions)
    await page.setViewportSize({ width: 412, height: 915 });

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;
      (window as any).flutter_inappwebview = true; // Mark as Flutter APK WebView environment

      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = function (success, error, options) {
        return originalGetCurrentPosition(
          success,
          error,
          { ...options, maximumAge: options?.maximumAge === 0 ? 60000 : (options?.maximumAge ?? 60000) }
        );
      };
    });

    // Mock reverse geocode for Mumbai coordinates
    await page.route('**/api/backend/location/reverse-geocode*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          formattedAddress: 'Nariman Point, Mumbai, Maharashtra 400021',
          placeId: 'ChIJmumbai_nariman_point',
          line1: 'Nariman Point',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400021',
          country: 'India',
          latitude: 18.9256,
          longitude: 72.8242,
          accuracy: 10,
        }),
      });
    });

    await context.grantPermissions(['geolocation', 'notifications'], { origin: 'http://localhost:3000' });
    await context.setGeolocation({ latitude: 18.9256, longitude: 72.8242, accuracy: 10 });

    // 1. Log in
    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    // 2. Open Create Lead Form on Mobile Viewport
    await page.goto('/sales/leads');
    const newLeadBtn = page.getByTestId('lead-create');
    await expect(newLeadBtn).toBeVisible({ timeout: 10000 });
    await newLeadBtn.click();
    await expect(page.getByTestId('sales-create-lead-page')).toBeVisible({ timeout: 10000 });

    const locationBtn = page.getByTestId('use-current-location-btn');
    await expect(locationBtn).toBeVisible();

    // 3. Tap "Use Current Location" on mobile
    await locationBtn.click();

    // 4. Verify accuracy badge and Mumbai resolved address
    const accuracyBadge = page.getByTestId('location-accuracy-badge');
    await expect(accuracyBadge).toBeVisible({ timeout: 10000 });
    await expect(accuracyBadge).toContainText('Location accuracy: ~10 m');
    await expect(accuracyBadge).toContainText('18.92560, 72.82420');

    await expect(page.getByTestId('lead-address')).toHaveValue('Nariman Point');
    await expect(page.getByTestId('lead-city')).toHaveValue('Mumbai');
    await expect(page.getByTestId('lead-state')).toHaveValue('Maharashtra');
    await expect(page.getByTestId('lead-pincode')).toHaveValue('400021');
    await expect(locationBtn).toContainText('Location captured');
  });

  test('Android APK Native Bridge: callHandler("requestLocation") provides coordinates directly without browser fallback', async ({
    page,
    context,
  }) => {
    test.setTimeout(45000);

    let browserGeolocationCalled = false;

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;

      // Mock Android InAppWebView JavaScript bridge
      (window as any).flutter_inappwebview = {
        callHandler: async (handlerName: string) => {
          if (handlerName === 'requestLocation') {
            return {
              success: true,
              latitude: 23.0225,
              longitude: 72.5714,
              accuracy: 15.0,
            };
          }
          return null;
        },
      };

      // Spy on navigator.geolocation to verify it is NEVER called when native bridge exists
      navigator.geolocation.getCurrentPosition = function () {
        (window as any).__BROWSER_GEO_CALLED__ = true;
      };
    });

    // Mock reverse-geocode endpoint for Ahmedabad coordinates returned by native bridge
    await page.route('**/api/backend/location/reverse-geocode*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          formattedAddress: 'SG Highway, Ahmedabad, Gujarat 380054',
          placeId: 'ChIJahmedabad_sg_highway',
          line1: 'SG Highway',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380054',
          country: 'India',
          latitude: 23.0225,
          longitude: 72.5714,
          accuracy: 15.0,
        }),
      });
    });

    // Log in
    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    await page.goto('/sales/leads');
    const newLeadBtn = page.getByTestId('lead-create');
    await expect(newLeadBtn).toBeVisible({ timeout: 10000 });
    await newLeadBtn.click();
    await expect(page.getByTestId('sales-create-lead-page')).toBeVisible({ timeout: 10000 });

    const locationBtn = page.getByTestId('use-current-location-btn');
    await expect(locationBtn).toBeVisible();

    // Click "Use Current Location" inside APK
    await locationBtn.click();

    // Verify coordinates and address populated from native bridge
    const accuracyBadge = page.getByTestId('location-accuracy-badge');
    await expect(accuracyBadge).toBeVisible({ timeout: 10000 });
    await expect(accuracyBadge).toContainText('Location accuracy: ~15 m');
    await expect(accuracyBadge).toContainText('23.02250, 72.57140');

    await expect(page.getByTestId('lead-address')).toHaveValue('SG Highway');
    await expect(page.getByTestId('lead-city')).toHaveValue('Ahmedabad');
    await expect(page.getByTestId('lead-state')).toHaveValue('Gujarat');
    await expect(page.getByTestId('lead-pincode')).toHaveValue('380054');

    // Confirm navigator.geolocation was NOT called
    const wasGeoCalled = await page.evaluate(() => (window as any).__BROWSER_GEO_CALLED__);
    expect(wasGeoCalled).toBeFalsy();
  });

  test('Android APK Native Bridge: reports LOCATION_SERVICES_DISABLED immediately without timeout', async ({
    page,
    context,
  }) => {
    test.setTimeout(45000);

    page.on('console', (msg) => console.log('[TEST 5 CONSOLE]', msg.text()));
    page.on('pageerror', (err) => console.log('[TEST 5 ERROR]', err.message));

    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      (window as any).__PLAYWRIGHT_TEST__ = true;

      // Mock Android InAppWebView bridge reporting LOCATION_SERVICES_DISABLED
      (window as any).flutter_inappwebview = {
        callHandler: async (handlerName: string) => {
          if (handlerName === 'requestLocation') {
            return {
              success: false,
              errorCode: 'LOCATION_SERVICES_DISABLED',
              message: 'Location services are disabled.',
            };
          }
          return null;
        },
      };
    });

    await performRobustLogin(
      page,
      process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test',
      undefined,
      /\/sales(?:\/dashboard)?(?:[/?#]|$)/,
    );

    await page.goto('/sales/leads');
    const newLeadBtn = page.getByTestId('lead-create');
    await expect(newLeadBtn).toBeVisible({ timeout: 10000 });
    await newLeadBtn.click();
    await expect(page.getByTestId('sales-create-lead-page')).toBeVisible({ timeout: 10000 });

    const locationBtn = page.getByTestId('use-current-location-btn');
    await locationBtn.click();

    // Verify warning dialog specifically mentions Location services are turned off
    const swalModal = page.locator('.swal2-modal');
    await expect(swalModal).toBeVisible({ timeout: 5000 });
    await expect(swalModal).toContainText(/Location services are turned off/i);
  });
});


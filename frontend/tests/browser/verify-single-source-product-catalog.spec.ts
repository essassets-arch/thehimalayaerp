import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/18857276-3a85-46f7-a487-faa1c6778da9';

async function getAuthToken() {
  try {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }),
    });
    const json = await res.json();
    return {
      token: json.data?.accessToken || '',
      userData: json.data?.user || null,
    };
  } catch (err) {
    console.error('Login fetch failed:', err);
    return { token: '', userData: null };
  }
}

async function loginUser(page: Page) {
  const { token, userData } = await getAuthToken();

  await page.addInitScript(
    ({ token, userData }) => {
      (window as any).__PLAYWRIGHT_TEST__ = true;
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
      localStorage.setItem('token', token);
      localStorage.setItem('himalaya_token', token);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('himalaya_token', token);

      const userObj = userData || {
        id: '1eeb9aa7-bf73-42cf-aee8-f3db6c9d5731',
        email: 'super.admin@himalayaerp.com',
        name: 'Super Admin',
        role: 'Super Admin',
        companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
      };
      sessionStorage.setItem('erpUser', JSON.stringify(userObj));
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: userObj,
            role: 'Super Admin',
            isAuthenticated: true,
            accessToken: token,
          },
          version: 0,
        }),
      );
    },
    { token, userData },
  );

  return token;
}

test.describe('Single Source-of-Truth Product Catalog & All Stock Contract', () => {
  test.setTimeout(120000);

  test('Test 1 & Invariant: /production/all-stock and Plant Head catalog query the exact same active products', async ({
    page,
  }) => {
    const token = await loginUser(page);

    // Verify backend API invariant directly:
    // COUNT(Plant Head Catalog) === COUNT(Production All Stock)
    const plantHeadRes = await fetch(
      'http://127.0.0.1:4000/api/v1/products?scope=catalog&limit=5000',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const plantHeadCatalog = await plantHeadRes.json();
    const plantHeadList = Array.isArray(plantHeadCatalog)
      ? plantHeadCatalog
      : (Array.isArray(plantHeadCatalog?.data) ? plantHeadCatalog.data : plantHeadCatalog?.data?.items || []);

    const allStockRes = await fetch(
      'http://127.0.0.1:4000/api/v1/production/all-stock',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const allStockJson = await allStockRes.json();
    const allStockItems = allStockJson?.data?.items || allStockJson?.items || (Array.isArray(allStockJson?.data) ? allStockJson.data : []);

    console.log(`[Invariant Check] Plant Head Catalog Count: ${plantHeadList.length}`);
    console.log(`[Invariant Check] Production All Stock Count: ${allStockItems.length}`);

    // Check invariant: counts must match exactly
    expect(allStockItems.length).toBe(plantHeadList.length);
    expect(allStockItems.length).toBeGreaterThan(0);

    // Verify UI renders the page
    await page.goto('http://localhost:3000/production/all-stock', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);

    await expect(page.getByRole('heading', { name: 'PRODUCTION INVENTORY MASTER' })).toBeVisible();
    await expect(page.locator('#btn-add-product')).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'test1_all_stock_loaded.png'),
      fullPage: true,
    });
  });

  test('Test 2: Zero-stock products appear with Available = 0 and OUT OF STOCK status', async ({
    page,
  }) => {
    const token = await loginUser(page);

    const allStockRes = await fetch(
      'http://127.0.0.1:4000/api/v1/production/all-stock',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const allStockJson = await allStockRes.json();
    const allStockItems = allStockJson?.data?.items || allStockJson?.items || (Array.isArray(allStockJson?.data) ? allStockJson.data : []);

    const zeroStockProducts = allStockItems.filter(
      (p: any) => (p.availableStock ?? p.availableQuantity ?? 0) === 0,
    );

    console.log(`[Zero Stock Check] Found ${zeroStockProducts.length} zero-stock products in catalog`);
    expect(zeroStockProducts.length).toBeGreaterThan(0);

    const sampleZero = zeroStockProducts[0];
    expect(sampleZero.status).toBe('OUT_OF_STOCK');
    expect(sampleZero.availableStock).toBe(0);

    // Search for this product on /production/all-stock
    await page.goto('http://localhost:3000/production/all-stock', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="Search product"]');
    await searchInput.fill(sampleZero.itemCode || sampleZero.productCode);
    await page.waitForTimeout(1000);

    const statusBadge = page.locator('span:has-text("OUT OF STOCK")').first();
    await expect(statusBadge).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'test2_zero_stock_product_visible.png'),
    });
  });

  test('Test 3 & Test 7: Add product → reflected in both pages and persists across refresh', async ({
    page,
  }) => {
    const token = await loginUser(page);
    const testSku = `HCP-TEST-${Date.now().toString().slice(-5)}`;
    const testName = `Himalaya FRP MHC ${testSku}`;

    await page.goto('http://localhost:3000/production/all-stock', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);

    // Open Add Product modal
    const addBtn = page.locator('#btn-add-product');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Fill form
    await page.locator('#add-product-name').fill(testName);
    await page.locator('#add-product-sku').fill(testSku);
    await page.locator('#add-product-category').selectOption('FRP Manhole Covers');
    await page.locator('#add-product-type').selectOption('MANUFACTURING');
    await page.locator('#add-product-opening-stock').fill('15');

    // Submit
    await page.locator('#btn-submit-add-product').click();
    await page.waitForTimeout(3000);

    // Verify product appears in /production/all-stock
    const searchInput = page.locator('input[placeholder*="Search product"]');
    await searchInput.fill(testSku);
    await page.waitForTimeout(1000);

    await expect(page.locator(`text=${testSku}`).first()).toBeVisible();

    // Refresh page and verify product remains (Test 7 persistence)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const searchInputAfterReload = page.locator('input[placeholder*="Search product"]');
    await searchInputAfterReload.fill(testSku);
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${testSku}`).first()).toBeVisible();

    // Verify it also appears in Plant Head catalog API
    const catalogCheckRes = await fetch(
      `http://127.0.0.1:4000/api/v1/products?scope=catalog&search=${testSku}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const catalogJson = await catalogCheckRes.json();
    const catalogItems = Array.isArray(catalogJson) ? catalogJson : (Array.isArray(catalogJson?.data) ? catalogJson.data : []);
    expect(catalogItems.some((p: any) => p.sku === testSku)).toBe(true);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'test3_7_product_added_and_persisted.png'),
    });
  });

  test('Test 4 & Test 9: Edit SKU → verify both pages use new SKU and no duplicate is created', async ({
    page,
  }) => {
    const token = await loginUser(page);
    const initialSku = `HCP-EDIT-${Date.now().toString().slice(-5)}`;
    const updatedSku = `${initialSku}-V2`;
    const initialName = `Product To Edit ${initialSku}`;
    const updatedName = `Product To Edit ${updatedSku}`;

    // Create via API
    const createRes = await fetch('http://127.0.0.1:4000/api/v1/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: initialName,
        sku: initialSku,
        category: 'FRP Manhole Covers',
        productType: 'MANUFACTURING',
        unit: 'PCS',
      }),
    });
    const createdProduct = await createRes.json();
    const productId = createdProduct?.data?.id || createdProduct?.id;

    // Navigate to /production/all-stock and search
    await page.goto('http://localhost:3000/production/all-stock', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="Search product"]');
    await searchInput.fill(initialSku);
    await page.waitForTimeout(1000);

    // Click Edit button
    const editBtn = page.locator(`button:has-text("Edit")`).first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // In Edit Modal, change SKU and Name
    await page.locator('#edit-product-name').fill(updatedName);
    await page.locator('#edit-product-sku').fill(updatedSku);
    await page.locator('#btn-submit-edit-product').click();
    await page.waitForTimeout(3000);

    // Verify updated SKU is displayed
    await searchInput.fill(updatedSku);
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${updatedSku}`).first()).toBeVisible();

    // Verify in Plant Head catalog API that updated SKU exists and old SKU does NOT
    const checkRes = await fetch(
      `http://127.0.0.1:4000/api/v1/products?scope=catalog&search=${initialSku}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const checkJson = await checkRes.json();
    const items = Array.isArray(checkJson) ? checkJson : (Array.isArray(checkJson?.data) ? checkJson.data : []);

    const oldMatches = items.filter((p: any) => p.sku === initialSku);
    const newMatches = items.filter((p: any) => p.sku === updatedSku);

    // No duplicate product created, and old SKU is updated!
    expect(oldMatches.length).toBe(0);
    expect(newMatches.length).toBe(1);
    expect(newMatches[0].id).toBe(productId);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'test4_9_sku_edited_no_duplicates.png'),
    });
  });

  test('Test 5: Perform Stock In and Stock Out → persists after page refresh', async ({
    page,
  }) => {
    const token = await loginUser(page);
    const sku = `HCP-STK-${Date.now().toString().slice(-5)}`;
    const name = `Stock Mutation Test ${sku}`;

    // Create product
    const createRes = await fetch('http://127.0.0.1:4000/api/v1/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        sku,
        category: 'FRP Manhole Covers',
        productType: 'MANUFACTURING',
        unit: 'PCS',
      }),
    });
    const prodRes = await createRes.json();
    const prod = prodRes?.data || prodRes;

    // Perform Stock In of 20
    await fetch('http://127.0.0.1:4000/api/v1/production/finished-goods/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: prod.id,
        quantity: 20,
        unit: 'PCS',
        reference: 'TEST_STOCK_IN',
      }),
    });

    // Perform Stock Out of 5
    await fetch('http://127.0.0.1:4000/api/v1/production/finished-goods/stock-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: prod.id,
        quantity: 5,
        unit: 'PCS',
        reason: 'TEST_STOCK_OUT',
      }),
    });

    // Verify on /production/all-stock
    await page.goto('http://localhost:3000/production/all-stock', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="Search product"]');
    await searchInput.fill(sku);
    await page.waitForTimeout(1000);

    // Available stock should be 15 (20 - 5)
    await expect(page.locator('strong:has-text("15")').first()).toBeVisible();

    // Reload page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const searchAfter = page.locator('input[placeholder*="Search product"]');
    await searchAfter.fill(sku);
    await page.waitForTimeout(1000);
    await expect(page.locator('strong:has-text("15")').first()).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'test5_stock_mutation_persisted.png'),
    });
  });

  test('Test 6: Extra Cover and Extra Frame are kept separate and properly accounted for in Available Stock', async ({
    page,
  }) => {
    const token = await loginUser(page);

    const allStockRes = await fetch(
      'http://127.0.0.1:4000/api/v1/production/all-stock',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const allStockJson = await allStockRes.json();
    const items = allStockJson?.data?.items || allStockJson?.items || [];

    // Verify that extraCover and extraFrame fields exist on items
    expect(items.length).toBeGreaterThan(0);
    for (const item of items.slice(0, 10)) {
      expect(item).toHaveProperty('extraCover');
      expect(item).toHaveProperty('extraFrame');
      expect(item).toHaveProperty('openingStock');
      expect(item).toHaveProperty('productionIn');
      expect(item).toHaveProperty('dispatchOut');
      expect(item).toHaveProperty('availableStock');

      // Verify formula:
      // Available = max(0, Opening + Prod In + Extra Cover + Extra Frame - Dispatch Out - Reserved)
      const calculated = Math.max(
        0,
        item.openingStock +
          item.productionIn +
          item.extraCover +
          item.extraFrame -
          item.dispatchOut -
          item.reservedQty,
      );
      expect(item.availableStock).toBe(calculated);
    }
  });

  test('Test 8: Product with no FinishedGoods/StockHistory records appears with all stock values = 0', async ({
    page,
  }) => {
    const token = await loginUser(page);
    const zeroSku = `HCP-ZERO-${Date.now().toString().slice(-5)}`;
    const zeroName = `Zero History Product ${zeroSku}`;

    // Create a product with zero initial stock and zero reports
    const createRes = await fetch('http://127.0.0.1:4000/api/v1/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: zeroName,
        sku: zeroSku,
        category: 'FRP Manhole Covers',
        productType: 'MANUFACTURING',
        unit: 'PCS',
      }),
    });
    expect(createRes.status).toBe(201);

    // Fetch from all-stock
    const allStockRes = await fetch(
      'http://127.0.0.1:4000/api/v1/production/all-stock',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const allStockJson = await allStockRes.json();
    const items = allStockJson?.data?.items || allStockJson?.items || [];
    const found = items.find((p: any) => p.itemCode === zeroSku || p.productCode === zeroSku);

    expect(found).toBeDefined();
    expect(found.openingStock).toBe(0);
    expect(found.productionIn).toBe(0);
    expect(found.extraCover).toBe(0);
    expect(found.extraFrame).toBe(0);
    expect(found.dispatchOut).toBe(0);
    expect(found.reservedQty).toBe(0);
    expect(found.availableStock).toBe(0);
    expect(found.status).toBe('OUT_OF_STOCK');
  });

  test('Test 10: Repeat stock mutation request → idempotency safeguard prevents double-counting', async ({
    page,
  }) => {
    const token = await loginUser(page);
    const sku = `HCP-IDEM-${Date.now().toString().slice(-5)}`;
    const name = `Idempotency Test ${sku}`;

    // Create product
    const createRes = await fetch('http://127.0.0.1:4000/api/v1/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        sku,
        category: 'FRP Manhole Covers',
        productType: 'MANUFACTURING',
        unit: 'PCS',
      }),
    });
    const prodRes = await createRes.json();
    const prod = prodRes?.data || prodRes;

    // Adjust physical stock to exactly 50
    const adjustRes1 = await fetch(
      'http://127.0.0.1:4000/api/v1/production/finished-goods/adjust',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: prod.id,
          newPhysicalStock: 50,
          reason: 'Initial physical reconciliation',
        }),
      },
    );
    expect(adjustRes1.status).toBe(201);

    // Repeat identical adjust request with same physical stock 50
    const adjustRes2 = await fetch(
      'http://127.0.0.1:4000/api/v1/production/finished-goods/adjust',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: prod.id,
          newPhysicalStock: 50,
          reason: 'Initial physical reconciliation',
        }),
      },
    );
    expect(adjustRes2.status).toBe(201);

    // Check all-stock endpoint: stock must remain 50, NOT 100!
    const allStockRes = await fetch(
      'http://127.0.0.1:4000/api/v1/production/all-stock',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const allStockJson = await allStockRes.json();
    const items = allStockJson?.data?.items || allStockJson?.items || [];
    const item = items.find((p: any) => p.itemCode === sku || p.productCode === sku);

    expect(item).toBeDefined();
    expect(item.availableStock).toBe(50);
  });
});

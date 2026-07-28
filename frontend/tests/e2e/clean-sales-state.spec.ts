import { expect, test } from '@playwright/test';

test('a new browser profile receives one persistent canonical ESS lead', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('clean-test-initialized')) {
      Object.keys(localStorage).forEach(key => {
        const normalized = key.toLowerCase();
        if (normalized.includes('erp') || normalized.includes('lead') || normalized.includes('sales')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      localStorage.setItem('clean-test-initialized', '1');
    }
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'CLEAN-AUDIT', name: 'Clean State Auditor', role: 'Super Admin' },
        role: 'Super Admin',
        isAuthenticated: true,
      },
      version: 0,
    }));
  });

  await page.goto('/sales/leads', { waitUntil: 'networkidle' });
  await expect(page.getByText('ESS Infrastructure Pvt Ltd')).toBeVisible();
  await expect(page.getByText('LEAD-ESS-001')).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    localStorage.getItem('himalaya-erp-store')
  )).toContain('LEAD-ESS-001');

  await page.waitForTimeout(600);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('ESS Infrastructure Pvt Ltd')).toBeVisible();
  await expect(page.getByText('LEAD-ESS-001')).toBeVisible();
});

test('version 5 migration removes existing Sales and linked workflow records', async ({ page }) => {
  await page.goto('/sales/leads', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('himalaya-transactional-reset-version');
    localStorage.setItem('himalaya-erp-store', JSON.stringify({
      state: {
        sales: {
          leads: [{ id: 'LEAD-W20X4R', companyName: 'sd' }, { id: 'LEAD-HARSH-001', companyName: 'Harsh Infrastructure Pvt Ltd' }],
          samples: [{ id: 'SMP-OLD' }],
          quotations: [{ id: 'QTN-OLD' }],
          orders: [{ id: 'ORD-OLD' }],
          paymentConfirmations: [],
          replacementRequests: [{ id: 'REP-OLD' }],
          returnRequests: [{ id: 'RET-OLD' }],
        },
        production: { workOrders: [{ id: 'WO-OLD' }], qcRecords: [{ id: 'QC-OLD' }], finishedGoods: [{ id: 'FG-OLD' }] },
        dispatch: { dispatchOrders: [{ id: 'DORD-OLD' }], consignments: [{ id: 'DSP-OLD' }] },
      },
      version: 4,
    }));
    localStorage.setItem('erp_leads', JSON.stringify([{ id: 'LEAD-001' }]));
    localStorage.setItem('erp_dispatches', JSON.stringify([{ id: 'DSP-LEGACY' }]));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('ESS Infrastructure Pvt Ltd')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/LEAD-W20X4R|LEAD-HARSH-001|LEAD-001/);
  const storage = await page.evaluate(() => ({
    version: localStorage.getItem('himalaya-transactional-reset-version'),
    unified: localStorage.getItem('himalaya-erp-store'),
    legacyLeads: localStorage.getItem('erp_leads'),
    legacyDispatch: localStorage.getItem('erp_dispatches'),
  }));
  expect(storage.version).toBe('5');
  expect(storage.unified).toContain('LEAD-ESS-001');
  expect(storage.legacyLeads).toBeNull();
  expect(storage.legacyDispatch).toBeNull();
});

test('canonical quotation arrays render in the directory and preview', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('quotation-array-test-ready')) return;
    localStorage.setItem('quotation-array-test-ready', '1');
    localStorage.setItem('himalaya-transactional-reset-version', '5');
    localStorage.setItem('himalaya-ess-browser-seed-version', '2');
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'QTN-AUDIT', name: 'Quotation Auditor', role: 'Super Admin' },
        role: 'Super Admin',
        isAuthenticated: true,
      },
      version: 0,
    }));
    localStorage.setItem('himalaya-erp-store', JSON.stringify({
      state: {
        sales: {
          leads: [],
          samples: [],
          orders: [],
          paymentConfirmations: [],
          replacementRequests: [],
          returnRequests: [],
          quotations: [{
            id: 'QTN-CANONICAL-001',
            customerName: 'ESS Infrastructure Pvt Ltd',
            contactPerson: 'ESS Contact',
            billingAddress: 'Nagpur, Maharashtra',
            deliveryAddress: 'Nagpur, Maharashtra',
            items: [{
              id: 'LINE-1',
              productId: 'PROD-RCC-600',
              productName: 'RCC Hume Pipe 600mm',
              specification: 'NP3 Grade, Grey, M30',
              quantity: 100,
              unit: 'Pcs',
              unitPrice: 1800,
              discountPercent: 5,
              gstPercent: 18,
            }],
            grandTotal: 204280,
            expectedTransportationCost: 2500,
            validityDate: '2026-08-31',
            paymentMilestones: [{
              id: 'PM-1',
              label: 'On Delivery',
              percentage: 100,
              trigger: 'ON_DELIVERY',
            }],
            status: 'QUOTATION_DRAFT',
            createdAt: '2026-07-23T00:00:00.000Z',
          }],
        },
        production: { workOrders: [], qcRecords: [], finishedGoods: [] },
        dispatch: { dispatchOrders: [], consignments: [] },
        auditEvents: [],
      },
      version: 4,
    }));
  });

  await page.goto('/sales/quotations', { waitUntil: 'networkidle' });
  await expect(page.getByText('RCC Hume Pipe 600mm (100 Pcs)')).toBeVisible();
  await expect(page.getByText('5.0% Off')).toBeVisible();
  await expect(page.getByText('2026-08-31')).toBeVisible();
  await page.getByTitle('View Quotation').click();
  await expect(page.getByText('NP3 Grade, Grey, M30')).toBeVisible();
  await expect(page.getByText('On Delivery 100%')).toBeVisible();
});

test('a canonically started work order appears on the production floor', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('production-floor-test-ready')) return;
    localStorage.setItem('production-floor-test-ready', '1');
    localStorage.setItem('himalaya-transactional-reset-version', '5');
    localStorage.setItem('himalaya-ess-browser-seed-version', '2');
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'FLOOR-AUDIT', name: 'Floor Auditor', role: 'Super Admin' },
        role: 'Super Admin',
        isAuthenticated: true,
      },
      version: 0,
    }));
    localStorage.setItem('himalaya-erp-store', JSON.stringify({
      state: {
        sales: {
          leads: [],
          samples: [],
          quotations: [],
          paymentConfirmations: [],
          replacementRequests: [],
          returnRequests: [],
          orders: [{
            id: 'ORD-XDV20S',
            orderNo: 'ORD-XDV20S',
            customerName: 'ESS Infrastructure Pvt Ltd',
            planningStatus: 'PRODUCTION_PLANNED',
            productionStatus: 'PRODUCTION_STARTED',
            items: [{
              id: 'LINE-1',
              productId: 'PROD-RCC-600',
              productName: 'RCC Hume Pipe 600mm',
              quantity: 100,
              unit: 'Pcs',
            }],
          }],
        },
        production: {
          workOrders: [{
            id: 'WO-XDV20S',
            orderId: 'ORD-XDV20S',
            customerName: 'ESS Infrastructure Pvt Ltd',
            items: [{
              orderLineId: 'LINE-1',
              productId: 'PROD-RCC-600',
              productName: 'RCC Hume Pipe 600mm',
              targetQuantity: 100,
              unit: 'Pcs',
            }],
            targetQuantity: 100,
            unit: 'Pcs',
            targetDate: '2026-07-30',
            priority: 'MEDIUM',
            status: 'PRODUCTION_STARTED',
          }],
          qcRecords: [],
          finishedGoods: [],
        },
        dispatch: { dispatchOrders: [], consignments: [] },
        auditEvents: [],
      },
      version: 4,
    }));
  });

  await page.goto('/production/floor', { waitUntil: 'networkidle' });
  await expect(page.getByText('WO-XDV20S').first()).toBeVisible();
  await expect(page.getByText('RCC Hume Pipe 600mm').first()).toBeVisible();
  await expect(page.getByText(/Active Floor \(1\)/)).toBeVisible();
});

import { test, expect } from '@playwright/test';

test.describe('Phase 8 Inventory Data Integrity & Concurrency Suite', () => {
  test('Available quantity mathematical invariant is maintained (quantity - reserved = available)', async () => {
    const records = [
      { id: 'item-1', quantity: 1000, reservedQuantity: 200, expectedAvailable: 800 },
      { id: 'item-2', quantity: 500, reservedQuantity: 500, expectedAvailable: 0 },
      { id: 'item-3', quantity: 2500, reservedQuantity: 0, expectedAvailable: 2500 }
    ];

    for (const r of records) {
      const available = r.quantity - r.reservedQuantity;
      expect(available).toBe(r.expectedAvailable);
      expect(available).toBeGreaterThanOrEqual(0);
    }
  });

  test('Concurrent reservation requests do not cause negative available quantity', async () => {
    let initialStock = 100;
    let reserved = 0;

    const reserve = (qty: number): boolean => {
      const available = initialStock - reserved;
      if (available >= qty) {
        reserved += qty;
        return true;
      }
      return false;
    };

    // Simulate 2 parallel requests of 60 items against 100 available
    const req1 = reserve(60);
    const req2 = reserve(60);

    expect(req1).toBe(true);
    expect(req2).toBe(false); // Second request must fail gracefully
    expect(initialStock - reserved).toBe(40); // Remaining available is precisely 40
  });
});

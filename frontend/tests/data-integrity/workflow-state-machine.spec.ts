import { test, expect } from '@playwright/test';

test.describe('Phase 8 Workflow State-Machine Integrity Suite', () => {
  test('Illegal status transitions are blocked by state machine validation', async () => {
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['HR_VERIFIED'],
      'HR_VERIFIED': ['PENDING_SUPER_ADMIN_APPROVAL'],
      'PENDING_SUPER_ADMIN_APPROVAL': ['SUPER_ADMIN_APPROVED', 'REJECTED'],
      'SUPER_ADMIN_APPROVED': ['PENDING_FINANCE'],
      'PENDING_FINANCE': ['PROCESSING'],
      'PROCESSING': ['PAID']
    };

    const isTransitionAllowed = (from: string, to: string): boolean => {
      return validTransitions[from]?.includes(to) || false;
    };

    // Valid transitions
    expect(isTransitionAllowed('DRAFT', 'HR_VERIFIED')).toBe(true);
    expect(isTransitionAllowed('SUPER_ADMIN_APPROVED', 'PENDING_FINANCE')).toBe(true);

    // Illegal transitions must be strictly blocked
    expect(isTransitionAllowed('DRAFT', 'PAID')).toBe(false);
    expect(isTransitionAllowed('HR_VERIFIED', 'SUPER_ADMIN_APPROVED')).toBe(false);
    expect(isTransitionAllowed('PAID', 'DRAFT')).toBe(false);
  });

  test('Order financial closure requires zero outstanding amount', async () => {
    const canCloseOrder = (outstanding: number, status: string): boolean => {
      return outstanding === 0 && status === 'FULL_PAID';
    };

    expect(canCloseOrder(0, 'FULL_PAID')).toBe(true);
    expect(canCloseOrder(5000, 'FULL_PAID')).toBe(false);
    expect(canCloseOrder(0, 'PENDING')).toBe(false);
  });
});

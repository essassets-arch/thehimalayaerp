import {
  isCustomerBlindRole,
  redactCustomerIdentity,
  sanitizeNotificationTextForBlindRole,
} from './customer-privacy.util';

describe('customer-privacy.util', () => {
  describe('isCustomerBlindRole', () => {
    it('returns true for Plant Head, Production, QC, and Store roles', () => {
      const blindRoles = [
        'PLANT_HEAD',
        'Plant Head',
        'PRODUCTION',
        'PRODUCTION_PLANNER',
        'PRODUCTION_OPERATOR',
        'Production Manager',
        'QC',
        'QC_INSPECTOR',
        'STORE',
        'STORE_MANAGER',
        'STORE_KEEPER',
      ];
      for (const role of blindRoles) {
        expect(isCustomerBlindRole(role)).toBe(true);
      }
    });

    it('returns false for Sales, Dispatch, Finance, Back Office, HR, and Super Admin', () => {
      const visibleRoles = [
        'SUPER_ADMIN',
        'ADMIN',
        'SALES',
        'SALES_EXECUTIVE',
        'SUPER_SALES',
        'SALES_MANAGER',
        'DISPATCH',
        'DISPATCH_EXECUTIVE',
        'DISPATCH_2',
        'FINANCE',
        'FINANCE_MANAGER',
        'FINANCE_EXECUTIVE',
        'BACK_OFFICE',
        'HR',
      ];
      for (const role of visibleRoles) {
        expect(isCustomerBlindRole(role)).toBe(false);
      }
    });
  });

  describe('redactCustomerIdentity', () => {
    it('strips customer name, contact, phone, GST, address, and lead while preserving orderNumber and products', () => {
      const sampleOrder = {
        id: 'so-1',
        orderNumber: 'HCPPL/2627/0145',
        customerName: 'Apex Infrastructure Pvt Ltd',
        resolvedCustomer: 'Apex Infrastructure Pvt Ltd',
        customerPhone: '9876543210',
        billingAddress: { city: 'Ahmedabad', line1: 'SG Highway' },
        shippingAddress: { city: 'Surat' },
        customer: {
          id: 'cust-1',
          companyName: 'Apex Infrastructure Pvt Ltd',
          contactPerson: 'Rajesh Patel',
          phone: '9876543210',
          email: 'rajesh@apexinfra.in',
          gstin: '24AAAAA0000A1Z5',
        },
        sourceQuotation: {
          id: 'q-1',
          quotationNumber: 'QT-001',
          siteInchargeName: 'Vikram Site',
          siteInchargeMobile: '9999988888',
          deliveryAddress: 'Plot 12, GIDC',
          lead: {
            id: 'l-1',
            companyName: 'Apex Infrastructure Pvt Ltd',
            groupName: 'Apex Group',
            projectName: 'Metro Phase 2',
            phone: '9876543210',
          },
        },
        items: [
          {
            id: 'item-1',
            productNameSnapshot: 'FRP Manhole Cover 600x600',
            orderedQuantity: 50,
            product: { id: 'p-1', name: 'FRP Manhole Cover 600x600', sku: 'FRP-600' },
          },
        ],
      };

      const redacted: any = redactCustomerIdentity(sampleOrder, {
        routePath: '/api/v1/sales/orders',
      });

      const serialized = JSON.stringify(redacted);
      expect(serialized).not.toContain('Apex');
      expect(serialized).not.toContain('Rajesh');
      expect(serialized).not.toContain('9876543210');
      expect(serialized).not.toContain('24AAAAA0000A1Z5');
      expect(serialized).not.toContain('Vikram Site');
      expect(serialized).not.toContain('Metro Phase 2');
      expect(serialized).not.toContain('SG Highway');

      // Preserves order ID and products/quantities intact
      expect(redacted.orderNumber).toBe('HCPPL/2627/0145');
      expect(redacted.customerName).toBe('HCPPL/2627/0145');
      expect(redacted.customer.masked).toBe(true);
      expect(redacted.customer.companyName).toBe('HCPPL/2627/0145');
      expect(redacted.items[0].productNameSnapshot).toBe('FRP Manhole Cover 600x600');
      expect(redacted.items[0].orderedQuantity).toBe(50);
    });

    it('preserves supplier/vendor and employee names completely untouched', () => {
      const po = {
        id: 'po-1',
        poNumber: 'PO-2026-009',
        supplier: { id: 'sup-1', name: 'Gujarat Resin Traders', phone: '9123456789' },
        createdBy: { id: 'u-1', name: 'Makhdum Store' },
      };
      const redacted: any = redactCustomerIdentity(po, {
        routePath: '/api/v1/store/material-requests',
      });
      expect(redacted.supplier.name).toBe('Gujarat Resin Traders');
      expect(redacted.supplier.phone).toBe('9123456789');
      expect(redacted.createdBy.name).toBe('Makhdum Store');
    });

    it('clears customer analytics arrays and dispatch/replacement addresses', () => {
      const analytics = {
        totalDispatches: 42,
        topCustomers: [{ name: 'Secret Corp', count: 12 }],
        byCustomer: [{ customerName: 'Secret Corp', qty: 100 }],
        customersList: [{ name: 'Secret Corp', weight: 500 }],
        newCustomers: [{ name: 'New Secret Ltd' }],
        dispatchOrders: [
          {
            id: 'DSP-01',
            soNumber: 'HCPPL/2627/0200',
            customer: 'Secret Corp',
            destination: 'Plot 99, Industrial Estate, Ahmedabad',
            replacementDeliveryAddress: 'Site B, Baroda',
            pickupAddress: 'Site A, Surat',
          },
        ],
      };
      const redacted: any = redactCustomerIdentity(analytics, {
        routePath: '/api/v1/plant-head/analytics/dispatch',
      });
      expect(redacted.totalDispatches).toBe(42);
      expect(redacted.topCustomers).toEqual([]);
      expect(redacted.byCustomer).toEqual([]);
      expect(redacted.customersList).toEqual([]);
      expect(redacted.newCustomers).toEqual([]);
      expect(redacted.dispatchOrders[0].soNumber).toBe('HCPPL/2627/0200');
      expect(redacted.dispatchOrders[0].customer).toBe('HCPPL/2627/0200');
      expect(redacted.dispatchOrders[0].destination).toBeNull();
      expect(redacted.dispatchOrders[0].replacementDeliveryAddress).toBeNull();
      expect(redacted.dispatchOrders[0].pickupAddress).toBeNull();
    });
  });

  describe('sanitizeNotificationTextForBlindRole', () => {
    it('scrubs real customer names and phrase patterns from notification text while keeping order ID', () => {
      const msg = 'Order HCPPL/2627/0145 for Apex Infrastructure Pvt Ltd has been sent to Plant Head.';
      const cleaned = sanitizeNotificationTextForBlindRole(msg, [
        'Apex Infrastructure Pvt Ltd',
        'Other Client',
      ]);
      expect(cleaned).not.toContain('Apex');
      expect(cleaned).toContain('HCPPL/2627/0145');
    });
  });
});

import { test, expect } from '@playwright/test';
import { getPrismaClient, generateTestSuffix } from '../sales-order/helpers/test-setup';
import { 
  createSalesTestContext,
  createProductLinkedLeadFixture,
  createDeliveredSampleFixture,
  createQuotationReadyForConversionFixture,
  createSalesOrderReadyForPlantHeadFixture,
  cleanupSalesFixture 
} from '../helpers/sales-fixture-factory';

test.describe('Prisma Fixture Contract Tests', () => {
  const prisma = getPrismaClient();

  test('Fixture factory creates and cleans up all required models successfully', async () => {
    const context = await createSalesTestContext(prisma);
    const suffix = generateTestSuffix() + '-CONTRACT';

    try {
      // 1. Lead
      const { lead, product: leadProduct, customer: leadCustomer } = await createProductLinkedLeadFixture(prisma, context, suffix);
      expect(lead).toBeDefined();
      expect(lead.companyId).toBe(context.companyId);
      expect(lead.customerId).toBe(leadCustomer.id);
      expect(lead.productInterest).toBe(leadProduct.name);

      // 2. Sample Request
      const { sample } = await createDeliveredSampleFixture(prisma, context, suffix);
      expect(sample).toBeDefined();
      expect(sample.companyId).toBe(context.companyId);
      expect(sample.status).toBe('DELIVERED');
      
      // 3. Quotation
      const { quotation } = await createQuotationReadyForConversionFixture(prisma, context, suffix);
      expect(quotation).toBeDefined();
      expect(quotation.companyId).toBe(context.companyId);
      
      const quotationItems = await prisma.quotationItem.findMany({ where: { quotationId: quotation.id } });
      expect(quotationItems.length).toBeGreaterThan(0);

      // 4. Sales Order ready for Plant Head
      const { salesOrder } = await createSalesOrderReadyForPlantHeadFixture(prisma, context, suffix);
      expect(salesOrder).toBeDefined();
      expect(salesOrder.status).toBe('CONFIRMED');

      const soItems = await prisma.salesOrderItem.findMany({ where: { salesOrderId: salesOrder.id } });
      expect(soItems.length).toBeGreaterThan(0);
      expect(soItems[0].salesOrderId).toBe(salesOrder.id);

      // Cleanup
      await cleanupSalesFixture(prisma, suffix);

      // Verify no orphans
      const orphansSO = await prisma.salesOrder.count({ where: { orderNumber: { endsWith: suffix } } });
      const orphansQT = await prisma.quotation.count({ where: { quotationNumber: { endsWith: suffix } } });
      const orphansSMP = await prisma.sampleRequest.count({ where: { sampleNumber: { endsWith: suffix } } });
      const orphansLD = await prisma.lead.count({ where: { leadNumber: { endsWith: suffix } } });
      const orphansCUST = await prisma.customer.count({ where: { customerCode: { endsWith: suffix } } });
      
      expect(orphansSO).toBe(0);
      expect(orphansQT).toBe(0);
      expect(orphansSMP).toBe(0);
      expect(orphansLD).toBe(0);
      expect(orphansCUST).toBe(0);

    } finally {
      await cleanupSalesFixture(prisma, suffix);
    }
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });
});

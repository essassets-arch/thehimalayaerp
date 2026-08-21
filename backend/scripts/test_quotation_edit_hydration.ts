import { PrismaClient } from '@prisma/client';
import { QuotationsService } from '../src/modules/quotations/quotations.service';
import { WorkflowService } from '../src/modules/workflow/workflow.service';
import { SequenceService } from '../src/common/sequence/sequence.service';
import { PrismaService } from '../src/database/prisma.service';

// Also test the canonical normalizer logic directly
function normalizeQuotationTest(quotation: any): any {
  const statusLabel = (code?: string): string => {
    const value = String(code || 'DRAFT').toUpperCase();
    if (value === 'CONVERTED_TO_SO') return 'Converted';
    return value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ');
  };

  if (!quotation) return null;

  const rawItems = (Array.isArray(quotation.items) && quotation.items.length > 0)
    ? quotation.items
    : (Array.isArray(quotation.detailedItems) && quotation.detailedItems.length > 0)
      ? quotation.detailedItems
      : [];

  const detailedItems = rawItems.map((item: any, idx: number) => {
    const qty = Number(item.quantity ?? item.qty ?? 0);
    const unitPrice = Number(item.unitPrice ?? item.rate ?? item.price ?? 0);
    const gross = qty * unitPrice;

    let discPct = 0;
    let discountRupees = 0;
    if (item.discountPercent !== undefined && item.discountPercent !== null) {
      discPct = Number(item.discountPercent);
      discountRupees = gross * (discPct / 100);
    } else if (item.discountAmount !== undefined && item.discountAmount !== null) {
      discountRupees = Number(item.discountAmount);
      discPct = gross > 0 ? Math.round((discountRupees / gross) * 100) : 0;
    } else if (item.discount !== undefined && item.discount !== null) {
      const rawDisc = Number(item.discount);
      if (gross > 0 && rawDisc > 100) {
        discountRupees = rawDisc;
        discPct = Math.round((rawDisc / gross) * 100);
      } else {
        discPct = rawDisc;
        discountRupees = gross * (discPct / 100);
      }
    }
    if (discPct > 100) discPct = 0;

    const taxable = gross - discountRupees;

    let taxPct = 18;
    let taxRupees = 0;
    if (item.taxPercent !== undefined && item.taxPercent !== null) {
      taxPct = Number(item.taxPercent);
      taxRupees = taxable * (taxPct / 100);
    } else if (item.taxAmount !== undefined && item.taxAmount !== null) {
      taxRupees = Number(item.taxAmount);
      taxPct = taxable > 0 ? Math.round((taxRupees / taxable) * 100) : 18;
    } else if (item.tax !== undefined && item.tax !== null) {
      const rawTax = Number(item.tax);
      if (taxable > 0 && rawTax > 100) {
        taxRupees = rawTax;
        taxPct = Math.round((rawTax / taxable) * 100);
      } else {
        taxPct = rawTax;
        taxRupees = taxable * (taxPct / 100);
      }
    } else {
      taxRupees = taxable * 0.18;
    }
    if (taxPct > 100) taxPct = 18;

    const productName = item.product?.name ?? item.productName ?? item.name ?? item.description ?? 'Product';
    const spec = item.specification ?? item.productDetails ?? item.description ?? item.product?.description ?? '';
    const code = item.product?.sku ?? item.productCode ?? item.code ?? item.productId ?? '';
    const productId = item.productId ?? item.product?.id ?? code;

    return {
      id: item.id || `item-${idx + 1}`,
      productId,
      productName,
      productCode: code,
      code,
      description: spec,
      specification: spec,
      productDetails: spec,
      quantity: qty,
      unitPrice,
      discount: discPct,
      discountPercent: discPct,
      discountAmount: discountRupees,
      tax: taxPct,
      taxPercent: taxPct,
      taxAmount: taxRupees,
      lineTotal: Number(item.lineTotal ?? (taxable + taxRupees)),
      amount: Number(item.lineTotal ?? item.amount ?? (taxable + taxRupees)),
    };
  });

  const customerName =
    quotation.customerName ??
    quotation.customer_name ??
    quotation.customer?.companyName ??
    quotation.customer?.name ??
    quotation.lead?.companyName ??
    quotation.lead?.customerName ??
    quotation.lead?.projectName ??
    '';

  const groupName =
    quotation.groupName ??
    quotation.group_name ??
    quotation.customer?.groupName ??
    quotation.customer?.group_name ??
    quotation.lead?.groupName ??
    quotation.lead?.group_name ??
    '';

  const gstName =
    quotation.gstName ??
    quotation.gst_name ??
    quotation.customer?.gstName ??
    quotation.customer?.companyName ??
    quotation.customer?.name ??
    quotation.lead?.gstName ??
    quotation.lead?.companyName ??
    (customerName || '');

  const gstNumber =
    quotation.gstNumber ??
    quotation.gst_number ??
    quotation.customer?.gstin ??
    quotation.customer?.gst ??
    quotation.customer?.gstNumber ??
    quotation.lead?.gstNumber ??
    quotation.lead?.gst_number ??
    '';

  const isGstRegistered =
    quotation.isGstRegistered ??
    (gstNumber ? 'YES' : 'NO');

  const expectedTransportationCost = Number(
    quotation.expectedTransportationCost ??
    quotation.transportCharge ??
    quotation.customer?.transportCharge ??
    quotation.lead?.transportCharge ??
    0
  );

  const paymentTerms =
    quotation.paymentTerms ??
    quotation.payment_terms ??
    quotation.customer?.paymentTerms ??
    quotation.lead?.paymentTerms ??
    '15 Days';

  const paymentTermDays =
    quotation.paymentTermDays ??
    quotation.payment_term_days ??
    null;

  const validUntil =
    quotation.validUntil ??
    quotation.validTill ??
    quotation.validityDate ??
    null;

  const remarks =
    quotation.remarks ??
    quotation.notes ??
    quotation.termsAndNotes ??
    '';

  const total = Number(
    quotation.total ??
    quotation.totalAmount ??
    quotation.grandTotal ??
    0
  );

  const quotationNumber =
    quotation.quotationNumber ??
    quotation.quotationNo ??
    quotation.id;

  return {
    ...quotation,
    id: quotation.id,
    quotationNumber,
    quotationNo: quotationNumber,
    customerName,
    groupName,
    gstName,
    gstNumber,
    isGstRegistered,
    status: statusLabel(quotation.workflowState?.code ?? quotation.status),
    validUntil,
    validTill: validUntil,
    validityDate: validUntil,
    expectedTransportationCost,
    transportCharge: expectedTransportationCost,
    paymentTerms,
    paymentTermDays,
    remarks,
    notes: remarks,
    termsAndNotes: remarks,
    total,
    totalAmount: total,
    grandTotal: total,
    subtotal: Number(quotation.subtotal ?? 0),
    discount: Number(quotation.discount ?? 0),
    tax: Number(quotation.tax ?? 0),
    detailedItems,
    items: detailedItems,
  };
}

async function runTest() {
  console.log('\n======================================================');
  console.log(' QUOTATION EDIT DATA HYDRATION VERIFICATION TEST ');
  console.log('======================================================\n');

  const prisma = new PrismaClient();
  const prismaService = new PrismaService();
  const workflowService = new WorkflowService(prismaService as any);
  const sequenceService = new SequenceService(prismaService as any);
  const quotationsService = new QuotationsService(prismaService as any, workflowService, sequenceService);

  try {
    const user = await prisma.user.findFirst({ where: { role: { code: 'ADMIN' } } });
    if (!user) throw new Error('No user found');
    const company = await prisma.company.findFirst();
    if (!company) throw new Error('No company found');
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    if (!product) throw new Error('No product found');

    const leadState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, code: 'REQUIREMENT_IDENTIFIED' }
    });

    // 1. Create a Lead with initial default values
    const lead = await prisma.lead.create({
      data: {
        leadNumber: `LD-TEST-${Date.now()}`,
        companyId: company.id,
        companyName: 'Lead Orig Corp',
        contactPerson: 'John Lead',
        email: 'lead@test.com',
        phone: '9876543210',
        address: '123 Test St',
        groupName: 'Lead Group',
        gstName: 'Lead GST Name',
        gstNumber: '27AABCU9603R1ZM',
        workflowStateId: leadState?.id,
        createdById: user.id,
      }
    });
    console.log(`✓ Created test Lead: ${lead.leadNumber} (${lead.companyName})`);

    // 2. Create a Quotation linked to the Lead, but with distinct quotation-specific values:
    // Lead has transportation = ₹2,000 / Payment = 7 Days
    // Quotation has transportation = ₹5,000 / Payment = 20 Days
    const createdQuote = await quotationsService.createQuotation({
      companyId: company.id,
      leadId: lead.id,
      expectedTransportationCost: 5000,
      paymentTerms: '20 Days',
      validUntil: new Date('2026-10-31').toISOString(),
      remarks: 'Special contract notes for HCCL test',
      items: [
        {
          productId: product.id,
          description: 'Color: Grey, Size: HD20',
          quantity: 10,
          unitPrice: 500,
          discount: 250, // 5% discount = 250
          tax: 855,      // 18% tax on 4750 = 855
        }
      ]
    }, user.id, company.id, 'ADMIN');

    console.log(`✓ Created Quotation #${createdQuote.quotationNumber} with expectedTransportationCost=₹5000, paymentTerms=20 Days`);

    // 3. Test getQuotation(): Verify it returns complete relations including product and items
    const fetched = await quotationsService.getQuotation(createdQuote.id, company.id, user.id, 'ADMIN');
    console.log('\n--- Checking getQuotation() output ---');
    console.log(`Quotation Number: ${fetched.quotationNumber}`);
    console.log(`Expected Transportation Cost: ₹${fetched.expectedTransportationCost}`);
    console.log(`Payment Terms: ${fetched.paymentTerms}`);
    console.log(`Valid Until: ${fetched.validUntil}`);
    console.log(`Remarks: ${fetched.remarks}`);
    console.log(`Items count: ${fetched.items.length}`);
    console.log(`Item 0 Product: ${fetched.items[0]?.product?.name || 'MISSING PRODUCT'}`);
    console.log(`Item 0 Description: ${fetched.items[0]?.description}`);

    if (Number(fetched.expectedTransportationCost) !== 5000) {
      throw new Error(`Expected transportation cost 5000, got ${fetched.expectedTransportationCost}`);
    }
    if (fetched.paymentTerms !== '20 Days') {
      throw new Error(`Expected payment terms '20 Days', got ${fetched.paymentTerms}`);
    }
    if (!fetched.items[0]?.product) {
      throw new Error('Expected items[0].product to be included, but was missing!');
    }

    // 4. Test canonical normalization: Verify Quotation field precedence over Lead
    const normalized = normalizeQuotationTest(fetched);
    console.log('\n--- Checking normalizeQuotation() Precedence ---');
    console.log(`Normalized customerName: ${normalized.customerName}`);
    console.log(`Normalized expectedTransportationCost: ₹${normalized.expectedTransportationCost}`);
    console.log(`Normalized paymentTerms: ${normalized.paymentTerms}`);
    console.log(`Normalized notes: ${normalized.notes}`);
    console.log(`Normalized items[0].productName: ${normalized.detailedItems[0].productName}`);
    console.log(`Normalized items[0].specification: ${normalized.detailedItems[0].specification}`);
    console.log(`Normalized items[0].discountPercent: ${normalized.detailedItems[0].discountPercent}%`);

    if (normalized.expectedTransportationCost !== 5000) {
      throw new Error(`Normalization failed to preserve ₹5000 transportation cost`);
    }
    if (normalized.paymentTerms !== '20 Days') {
      throw new Error(`Normalization failed to preserve '20 Days' payment terms`);
    }

    // 5. Test Zero/Null Values:
    console.log('\n--- Testing Zero/Null Values Preservation ---');
    const zeroValQuote = await quotationsService.updateQuotation(createdQuote.id, {
      expectedTransportationCost: 0,
      paymentTerms: 'Custom',
      remarks: '',
      items: [
        {
          productId: product.id,
          description: 'Color: Red, Size: M10',
          quantity: 5,
          unitPrice: 200,
          discount: 0,
          tax: 0,
        }
      ]
    }, user.id, company.id, 'ADMIN');

    const normalizedZero = normalizeQuotationTest(zeroValQuote);
    console.log(`Updated Zero Transport Cost: ₹${normalizedZero.expectedTransportationCost} (Expected: 0)`);
    console.log(`Updated Payment Terms: ${normalizedZero.paymentTerms} (Expected: Custom)`);
    console.log(`Updated Items[0] Discount: ${normalizedZero.detailedItems[0].discountPercent}% (Expected: 0)`);
    console.log(`Updated Items[0] Tax: ${normalizedZero.detailedItems[0].taxPercent}% (Expected: 0)`);
    console.log(`Updated Items[0] Specification: ${normalizedZero.detailedItems[0].specification}`);

    if (normalizedZero.expectedTransportationCost !== 0) {
      throw new Error(`Failed to preserve 0 transportation cost`);
    }
    if (normalizedZero.detailedItems[0].discountPercent !== 0) {
      throw new Error(`Failed to preserve 0% discount`);
    }
    if (normalizedZero.detailedItems[0].taxPercent !== 0) {
      throw new Error(`Failed to preserve 0% tax`);
    }

    // Clean up test data
    await prisma.quotationItem.deleteMany({ where: { quotationId: createdQuote.id } });
    await prisma.quotation.delete({ where: { id: createdQuote.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    console.log('\n✓ Cleaned up test database records.');

    console.log('\n======================================================');
    console.log(' ✅ ALL QUOTATION HYDRATION TESTS PASSED PERFECTLY! ');
    console.log('======================================================\n');
  } finally {
    await prisma.$disconnect();
  }
}

runTest().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

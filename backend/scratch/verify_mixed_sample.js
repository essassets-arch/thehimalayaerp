const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== VERIFYING SAMPLES & PRODUCTS ===');

  // 1. Find a company
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found');
    return;
  }
  const companyId = company.id;

  // 2. Find or create a Lead with address, detailedItems, contactPerson, transportationCost
  let lead = await prisma.lead.findFirst({
    where: { companyId, leadNumber: 'LEAD/2627/0190' },
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        leadNumber: 'LEAD/2627/0190',
        companyId,
        companyName: 'Himalaya Commercial Projects Pvt Ltd',
        contactPerson: 'Suresh Verma',
        phone: '9876543210',
        email: 'suresh.verma@himalayaprojects.com',
        createdById: 'a6605e65-beca-40f2-a19f-8e451e270867',
        address: {
          line1: 'Plot 44, Industrial Area Phase II',
          city: 'Jaipur',
          state: 'Rajasthan',
          country: 'India',
          pincode: '302013',
        },
        detailedItems: [
          {
            product: 'MHC',
            productName: 'HIMALAYA FRP MHC 600X600 B125',
            productCode: 'FRPMHC600B125',
            size: '600X600',
            color: 'GREY',
            capacity: 'B125',
            quantity: 1,
            unitPrice: 7250,
            specification: 'FRP Manhole Cover with Frame 600x600 B125 Load',
          },
          {
            product: 'RCS',
            productName: 'HIMALAYA FRP RCS 600X600X65 B125',
            productCode: 'FRPRCS600X65B125',
            size: '600X600X65',
            color: 'GREY',
            capacity: 'B125',
            quantity: 1,
            unitPrice: 8500,
            specification: 'FRP Recessed Cover & Frame 600x600x65 B125 Load',
          },
          {
            product: 'GRATING',
            productName: 'FRP MOULDED GRATING 30MM',
            productCode: 'FRPGRT30MM',
            size: '30MM',
            color: 'YELLOW',
            capacity: 'Standard',
            quantity: 1,
            unitPrice: 4200,
            specification: 'Moulded Gratings Yellow 30mm thickness',
          },
          {
            product: 'COVERBLOCK',
            productName: 'COVERBLOCK 25MM',
            productCode: 'WCB25MM',
            size: '25MM',
            color: 'GREY',
            capacity: 'Standard',
            quantity: 50,
            unitPrice: 5,
            specification: 'PVC Concrete Cover Blocks 25mm for slab reinforcement',
          },
        ],
        remarks: 'Handle with care, commercial test samples requested by client.',
      },
    });
    console.log('Created lead LEAD/2627/0190:', lead.id);
  } else {
    console.log('Found existing lead LEAD/2627/0190:', lead.id);
  }

  // 3. Find or create Products
  // D1 Manufacturing Products
  const mhcProd = await prisma.product.upsert({
    where: { publicId: 'PRD-TEST-MHC-600' },
    update: {
      category: 'FRP COVERS',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      size: '600X600',
      capacity: 'B125',
    },
    create: {
      companyId,
      publicId: 'PRD-TEST-MHC-600',
      name: 'HIMALAYA FRP MHC 600X600 B125',
      sku: 'FRPMHC600B125',
      unit: 'PCS',
      unitPrice: 7250,
      category: 'FRP COVERS',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      size: '600X600',
      capacity: 'B125',
    },
  });

  const rcsProd = await prisma.product.upsert({
    where: { publicId: 'PRD-TEST-RCS-600' },
    update: {
      category: 'FRP COVERS',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      size: '600X600X65',
      capacity: 'B125',
    },
    create: {
      companyId,
      publicId: 'PRD-TEST-RCS-600',
      name: 'HIMALAYA FRP RCS 600X600X65 B125',
      sku: 'FRPRCS600X65B125',
      unit: 'PCS',
      unitPrice: 8500,
      category: 'FRP COVERS',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      size: '600X600X65',
      capacity: 'B125',
    },
  });

  const gratingProd = await prisma.product.upsert({
    where: { publicId: 'PRD-TEST-GRT-30' },
    update: {
      category: 'FRP GRATINGS',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      size: '30MM',
      capacity: 'Standard',
    },
    create: {
      companyId,
      publicId: 'PRD-TEST-GRT-30',
      name: 'FRP MOULDED GRATING 30MM',
      sku: 'FRPGRT30MM',
      unit: 'PCS',
      unitPrice: 4200,
      category: 'FRP GRATINGS',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      size: '30MM',
      capacity: 'Standard',
    },
  });

  // D2 Trading Product
  const coverblockProd = await prisma.product.upsert({
    where: { publicId: 'PRD-TEST-CB-25' },
    update: {
      category: 'COVERBLOCK',
      productType: 'TRADING',
      dispatchCategory: 'D2',
      size: '25MM',
      capacity: 'Standard',
    },
    create: {
      companyId,
      publicId: 'PRD-TEST-CB-25',
      name: 'COVERBLOCK 25MM',
      sku: 'WCB25MM',
      unit: 'PCS',
      unitPrice: 5,
      category: 'COVERBLOCK',
      productType: 'TRADING',
      dispatchCategory: 'D2',
      size: '25MM',
      capacity: 'Standard',
    },
  });

  // 4. Create sample SMP-2026-0001 with mixed items and transport cost
  let sample = await prisma.sampleRequest.findFirst({
    where: { sampleNumber: 'SMP-2026-0001' },
    include: { items: true },
  });

  if (sample) {
    await prisma.sampleItem.deleteMany({ where: { sampleRequestId: sample.id } });
    await prisma.sampleRequest.delete({ where: { id: sample.id } });
  }

  sample = await prisma.sampleRequest.create({
    data: {
      sampleNumber: 'SMP-2026-0001',
      companyId,
      leadId: lead.id,
      transportCost: 750.0,
      status: 'PENDING_DISPATCH',
      items: {
        create: [
          {
            productId: mhcProd.id,
            quantity: 1,
            specifications: 'HIMALAYA FRP MHC 600X600 B125',
          },
          {
            productId: rcsProd.id,
            quantity: 1,
            specifications: 'HIMALAYA FRP RCS 600X600X65 B125',
          },
          {
            productId: gratingProd.id,
            quantity: 1,
            specifications: 'FRP MOULDED GRATING 30MM',
          },
          {
            productId: coverblockProd.id,
            quantity: 50,
            specifications: 'COVERBLOCK 25MM',
          },
        ],
      },
    },
    include: {
      items: { include: { product: true } },
      lead: true,
    },
  });

  console.log(`Created sample ${sample.sampleNumber} with ${sample.items.length} items (3 Manufacturing, 1 Trading).`);
  console.log('Sample transportCost:', sample.transportCost);
}

main().catch(console.error).finally(() => prisma.$disconnect());

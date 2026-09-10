const { PrismaClient } = require('@prisma/client');

async function cleanDb(port, dbUrl) {
  console.log(`\n=== Cleaning and updating Suppliers on port ${port} ===`);
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  try {
    // 1. Rename any existing 'Default Supplier' or 'Default Vendor'
    const defaultSuppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          { name: { contains: 'Default Supplier', mode: 'insensitive' } },
          { name: { contains: 'Default Vendor', mode: 'insensitive' } },
        ],
      },
    });

    console.log(`Found ${defaultSuppliers.length} 'Default Supplier' records on port ${port}`);
    for (let i = 0; i < defaultSuppliers.length; i++) {
      const s = defaultSuppliers[i];
      const newName = i === 0 ? 'Himalaya Prime Raw Materials Ltd' : 'Standard Steel & Hardware Works';
      const newPublicId = i === 0 ? 'SUP-HPRM-001' : `SUP-SSHW-00${i + 1}`;
      const newGstin = i === 0 ? '27AAACH1234A1Z9' : '27AAACS5678B1Z4';
      const newContact = i === 0 ? 'Rohit Verma' : 'Sunil Agarwal';
      const newEmail = i === 0 ? 'supplies@himalayaprime.com' : 'orders@standardsteel.in';
      const newPhone = i === 0 ? '+91-9820011223' : '+91-9830022334';

      await prisma.supplier.update({
        where: { id: s.id },
        data: {
          name: newName,
          publicId: newPublicId,
          gstin: newGstin,
          contact: newContact,
          email: newEmail,
          phone: newPhone,
        },
      });
      console.log(`✓ Renamed supplier ${s.id} -> "${newName}" (${newPublicId})`);

      // Update snapshots on linked POs
      const linkedPos = await prisma.purchaseOrder.findMany({ where: { supplierId: s.id } });
      for (const po of linkedPos) {
        const snap = (po.snapshot || {});
        if (!snap.vendorName || snap.vendorName.toLowerCase().includes('default')) {
          snap.vendorName = newName;
          snap.supplierName = newName;
          snap.vendorCode = newPublicId;
          await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { snapshot: snap },
          });
          console.log(`   ✓ Updated PO ${po.poNumber || po.publicId} snapshot vendorName -> "${newName}"`);
        }
      }
    }

    // 2. Ensure core dynamic suppliers exist
    const company = await prisma.company.findFirst();
    if (company) {
      const standardVendors = [
        {
          name: 'Tata Steel BSL Limited',
          publicId: 'SUP-TSBSL-001',
          gstin: '27AAACT2727Q1ZB',
          contact: 'Ajay Sharma',
          email: 'corporate.procure@tatasteel.com',
          phone: '+91-9822114455',
        },
        {
          name: 'Jindal Steel & Power Ltd',
          publicId: 'V-JSP-001',
          gstin: '07AAACJ2234K1ZB',
          contact: 'Rajesh Jindal',
          email: 'procurement@jindalsteel.com',
          phone: '+91-9811223344',
        },
        {
          name: 'UltraTech Cement Limited',
          publicId: 'SUP-UTCL-001',
          gstin: '27AAACU1234F1Z1',
          contact: 'Vikram Patel',
          email: 'sales@ultratech.adityabirla.com',
          phone: '+91-9821122334',
        },
      ];

      for (const v of standardVendors) {
        const exists = await prisma.supplier.findFirst({
          where: {
            companyId: company.id,
            OR: [{ name: v.name }, { publicId: v.publicId }],
          },
        });
        if (!exists) {
          await prisma.supplier.create({
            data: {
              ...v,
              companyId: company.id,
              isActive: true,
            },
          });
          console.log(`✓ Added standard dynamic vendor: "${v.name}" (${v.publicId})`);
        }
      }
    }

    // 3. Final verification on port
    const finalSuppliers = await prisma.supplier.findMany({ select: { id: true, publicId: true, name: true } });
    console.log(`\nFinal Suppliers on port ${port} (${finalSuppliers.length} total):`);
    finalSuppliers.forEach((s) => console.log(` - [${s.publicId}] "${s.name}"`));
  } catch (err) {
    console.error(`Error on port ${port}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await cleanDb(5435, 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await cleanDb(5432, 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main().catch(console.error);

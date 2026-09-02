const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetIds = [
    process.argv[2],
    '650a71c9-71cd-4952-bf4b-91e98b5f1fa8',
    '13583cda-9f87-4dd5-9adf-f3f85ab8c2ae',
    'EMP-5',
  ].filter(Boolean);

  console.log('=== DIAGNOSTIC INSPECTION FOR EMPLOYEES & DOCUMENTS ===\n');

  for (const tid of targetIds) {
    const emp = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: tid },
          { publicId: tid },
          { employeeCode: tid },
        ],
      },
      include: {
        documents: true,
        department: true,
        workLocation: true,
      },
    });

    if (emp) {
      console.log(`\n======================================================`);
      console.log(`EMPLOYEE: ${emp.fullName} (${emp.employeeCode}) [ID: ${emp.id}]`);
      console.log(`selfieUrl: ${emp.selfieUrl || 'null'}`);
      console.log(`signatureUrl: ${emp.signatureUrl || 'null'}`);
      console.log(`Department: ${emp.department?.name || emp.departmentId || 'null'}`);
      console.log(`Location: ${emp.workLocation?.name || emp.workLocationId || 'null'}`);
      console.log(`Documents count in relation: ${emp.documents?.length || 0}`);
      if (emp.documents && emp.documents.length > 0) {
        console.table(
          emp.documents.map((d) => ({
            id: d.id,
            documentType: d.documentType,
            documentName: d.documentName,
            storageKey: d.storageKey,
            mimeType: d.mimeType,
            fileSize: d.fileSize,
            createdAt: d.createdAt,
          }))
        );
      } else {
        console.log(`ℹ️  No documents linked to employee ${emp.id}`);
      }
    }
  }

  const allDocs = await prisma.employeeDocument.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n======================================================`);
  console.log(`TOTAL EMPLOYEE DOCUMENTS IN DATABASE: ${await prisma.employeeDocument.count()}`);
  if (allDocs.length > 0) {
    console.log('MOST RECENT 20 DOCUMENTS:');
    console.table(
      allDocs.map((d) => ({
        id: d.id,
        employeeId: d.employeeId,
        documentType: d.documentType,
        documentName: d.documentName,
        storageKey: d.storageKey,
        createdAt: d.createdAt,
      }))
    );
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

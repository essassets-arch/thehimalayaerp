const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkTables = [
  'CustomerPayment',
  'SalesReturnItem',
  'SalesReturn',
  'ReplacementOrderItem',
  'ReplacementRequestItem',
  'ReplacementRequest',
  'SalesOrderAllocation',
  'SalesOrderItem',
  'SalesOrder',
  'QuotationItem',
  'Quotation',
  'CustomerComplaint',
  'SampleItem',
  'SampleRequest',
  'LeadActivity',
  'Lead',
  'Notification',
  'QCInspection',
  'ProductionDailyReportItem',
  'WorkOrder',
  'MaterialRequestItem',
  'MaterialRequest',
  'ProductionPlan',
  'DispatchItem',
  'Dispatch'
];

async function main() {
  const existing = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  const existingSet = new Set(existing.map(t => t.table_name));
  for (const t of checkTables) {
    if (!existingSet.has(t)) {
      console.log('MISSING TABLE:', t);
    } else {
      console.log('EXISTS:', t);
    }
  }
}

main().finally(() => prisma.$disconnect());

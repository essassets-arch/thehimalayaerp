import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Workflow Engine...');

  const salesOrderFlow = await prisma.workflowDefinition.upsert({
    where: { code: 'SALES_ORDER_FLOW' },
    update: {},
    create: {
      code: 'SALES_ORDER_FLOW',
      name: 'Sales Order Fulfillment Workflow',
    },
  });

  const states = [
    { code: 'DRAFT', name: 'Draft', sequence: 10, isInitial: true },
    { code: 'PENDING_APPROVAL', name: 'Pending Approval', sequence: 20 },
    { code: 'APPROVED', name: 'Approved', sequence: 30 },
    { code: 'CREDIT_HOLD', name: 'Credit Hold', sequence: 40 },
    { code: 'STOCK_RESERVED', name: 'Stock Reserved', sequence: 50 },
    { code: 'PICKING', name: 'Picking', sequence: 60 },
    { code: 'PACKING', name: 'Packing', sequence: 70 },
    { code: 'DISPATCHED', name: 'Dispatched', sequence: 80 },
    { code: 'INVOICED', name: 'Invoiced', sequence: 90 },
    { code: 'COMPLETED', name: 'Completed', sequence: 100, isFinal: true },
    { code: 'CANCELLED', name: 'Cancelled', sequence: 999, isFinal: true },
  ];

  const stateRecords: Record<string, string> = {};

  for (const s of states) {
    const record = await prisma.workflowState.create({
      data: {
        workflowId: salesOrderFlow.id,
        code: s.code,
        name: s.name,
        sequence: s.sequence,
        isInitial: s.isInitial || false,
        isFinal: s.isFinal || false,
      },
    });
    stateRecords[s.code] = record.id;
  }

  const transitions = [
    { from: 'DRAFT', to: 'PENDING_APPROVAL', actionName: 'SUBMIT', actionLabel: 'Submit for Approval' },
    { from: 'DRAFT', to: 'CANCELLED', actionName: 'CANCEL', actionLabel: 'Cancel Order' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED', actionName: 'APPROVE', actionLabel: 'Approve Order', requiresApproval: true },
    { from: 'PENDING_APPROVAL', to: 'CREDIT_HOLD', actionName: 'HOLD_CREDIT', actionLabel: 'Put on Credit Hold' },
    { from: 'CREDIT_HOLD', to: 'APPROVED', actionName: 'APPROVE_CREDIT', actionLabel: 'Approve Credit Override', requiresApproval: true },
    { from: 'APPROVED', to: 'STOCK_RESERVED', actionName: 'RESERVE', actionLabel: 'Reserve Stock' },
    { from: 'STOCK_RESERVED', to: 'PICKING', actionName: 'START_PICKING', actionLabel: 'Start Picking' },
    { from: 'PICKING', to: 'PACKING', actionName: 'START_PACKING', actionLabel: 'Start Packing' },
    { from: 'PACKING', to: 'DISPATCHED', actionName: 'DISPATCH', actionLabel: 'Dispatch Order' },
    { from: 'DISPATCHED', to: 'INVOICED', actionName: 'INVOICE', actionLabel: 'Generate Invoice' },
    { from: 'INVOICED', to: 'COMPLETED', actionName: 'COMPLETE', actionLabel: 'Mark Completed' },
  ];

  for (const t of transitions) {
    await prisma.workflowTransition.create({
      data: {
        workflowId: salesOrderFlow.id,
        fromStateId: stateRecords[t.from],
        toStateId: stateRecords[t.to],
        actionName: t.actionName,
        actionLabel: t.actionLabel,
        requiresApproval: t.requiresApproval || false,
      },
    });
  }

  console.log('Workflow seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

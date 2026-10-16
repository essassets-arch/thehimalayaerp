import { ForbiddenException } from '@nestjs/common';
import { ProductionWorkflowService } from './production-workflow.service';

describe('ProductionWorkflowService dispatch tenant isolation', () => {
  it('scopes the ready queue query to the authenticated tenant', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new ProductionWorkflowService(
      { workOrder: { findMany } } as any,
      {} as any,
    );

    await service.getJobsByStatus(['READY_FOR_DISPATCH' as any], 'tenant-a');

    const where = findMany.mock.calls[0][0].where;
    expect(where.AND[1]).toEqual({
      OR: [
        { salesOrderItem: { product: { companyId: 'tenant-a' } } },
        { salesOrderItem: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
        { productionPlan: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
      ],
    });
  });

  it('rejects a cross-tenant work order before attempting any mutation', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const findUnique = jest.fn();
    const update = jest.fn();
    const tx = { workOrder: { findFirst, findUnique, update } };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const service = new ProductionWorkflowService(prisma as any, {} as any);

    await expect(service.sendToDispatch(['work-order-a'], 'user-a', 'tenant-a'))
      .rejects.toBeInstanceOf(ForbiddenException);

    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: 'work-order-a',
        AND: [{
          OR: [
            { salesOrderItem: { product: { companyId: 'tenant-a' } } },
            { salesOrderItem: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
            { productionPlan: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
          ],
        }],
      }),
    }));
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('authorizes work order when user tenant matches order customer tenant even if product companyId differs', async () => {
    const mockWo = {
      id: 'wo-1',
      workOrderNumber: 'WO-2026-00615',
      status: 'READY_FOR_DISPATCH',
      productionStatus: 'READY_FOR_DISPATCH',
      sentToDispatchAt: null,
      quantity: 5,
      productionPlan: {
        salesOrderId: 'so-1',
        salesOrder: {
          customer: {
            companyId: 'tenant-a',
          },
        },
      },
      salesOrderItem: {
        product: {
          companyId: 'legacy-tenant-b',
        },
      },
      qcInspections: [],
    };

    const findFirst = jest.fn().mockResolvedValue(mockWo);
    const update = jest.fn().mockResolvedValue({ ...mockWo, productionStatus: 'DISPATCHED' });
    const finishedGoods = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'fg-1' }),
    };
    const inventoryTransaction = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'it-1' }),
    };
    const warehouse = {
      findFirst: jest.fn().mockResolvedValue({ id: 'wh-1' }),
    };
    const salesOrder = {
      update: jest.fn().mockResolvedValue({ id: 'so-1' }),
    };
    const tx = {
      workOrder: { findFirst, update },
      salesOrder,
      finishedGoods,
      inventoryTransaction,
      warehouse,
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const service = new ProductionWorkflowService(prisma as any, {} as any);

    const result = await service.sendToDispatch(['wo-1'], 'user-a', 'tenant-a');
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'wo-1' },
      data: expect.objectContaining({
        productionStatus: 'DISPATCHED',
      }),
    }));
  });

  it('rejects work order with Tenant mismatch when user tenant does not match any order or product tenant', async () => {
    const mockWo = {
      id: 'wo-cross',
      workOrderNumber: 'WO-CROSS-001',
      status: 'READY_FOR_DISPATCH',
      productionStatus: 'READY_FOR_DISPATCH',
      sentToDispatchAt: null,
      quantity: 5,
      productionPlan: {
        salesOrderId: 'so-1',
        salesOrder: {
          customer: {
            companyId: 'tenant-b',
          },
        },
      },
      salesOrderItem: {
        product: {
          companyId: 'tenant-b',
        },
      },
      qcInspections: [],
    };

    const findFirst = jest.fn().mockResolvedValue(mockWo);
    const update = jest.fn();
    const tx = {
      workOrder: { findFirst, update },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const service = new ProductionWorkflowService(prisma as any, {} as any);

    await expect(service.sendToDispatch(['wo-cross'], 'user-a', 'tenant-a'))
      .rejects.toThrow('Tenant mismatch: Work order WO-CROSS-001 belongs to tenant tenant-b, unauthorized for tenant-a.');
    expect(update).not.toHaveBeenCalled();
  });
});

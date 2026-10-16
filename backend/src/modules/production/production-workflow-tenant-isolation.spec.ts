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
        {
          AND: [
            { salesOrderItem: null },
            { productionPlan: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
          ],
        },
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
            {
              AND: [
                { salesOrderItem: null },
                { productionPlan: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
              ],
            },
          ],
        }],
      }),
    }));
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

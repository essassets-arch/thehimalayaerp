import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: createMockPrismaService() },
        {
          provide: WorkflowService,
          useValue: { trigger: jest.fn(), log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

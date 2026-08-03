import { Test, TestingModule } from '@nestjs/testing';
import { ProductionService } from './production.service';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('ProductionService', () => {
  let service: ProductionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        { provide: PrismaService, useValue: createMockPrismaService() },
        {
          provide: WorkflowService,
          useValue: { trigger: jest.fn(), log: jest.fn() },
        },
        { provide: SequenceService, useValue: { generate: jest.fn() } },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

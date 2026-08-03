import { Test, TestingModule } from '@nestjs/testing';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  MockJwtAuthGuard,
  MockPermissionsGuard,
} from '../../../test/mocks/guards.mock';

describe('ProductionController', () => {
  let controller: ProductionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            findAllPlans: jest.fn().mockResolvedValue([]),
            createPlan: jest.fn().mockResolvedValue({ id: 'p-1' }),
          },
        },
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useClass(MockPermissionsGuard)
      .compile();

    controller = module.get<ProductionController>(ProductionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SalesReturnsController } from './sales-returns.controller';
import { SalesReturnsService } from './sales-returns.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  MockJwtAuthGuard,
  MockPermissionsGuard,
} from '../../../test/mocks/guards.mock';

describe('SalesReturnsController', () => {
  let controller: SalesReturnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesReturnsController],
      providers: [
        {
          provide: SalesReturnsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'sr-1' }),
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

    controller = module.get<SalesReturnsController>(SalesReturnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

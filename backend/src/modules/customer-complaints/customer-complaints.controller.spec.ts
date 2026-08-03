import { Test, TestingModule } from '@nestjs/testing';
import { CustomerComplaintsController } from './customer-complaints.controller';
import { CustomerComplaintsService } from './customer-complaints.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  MockJwtAuthGuard,
  MockPermissionsGuard,
} from '../../../test/mocks/guards.mock';

describe('CustomerComplaintsController', () => {
  let controller: CustomerComplaintsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerComplaintsController],
      providers: [
        {
          provide: CustomerComplaintsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 'comp-1' }),
            create: jest.fn().mockResolvedValue({ id: 'comp-1' }),
            update: jest.fn().mockResolvedValue({ id: 'comp-1' }),
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

    controller = module.get<CustomerComplaintsController>(
      CustomerComplaintsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

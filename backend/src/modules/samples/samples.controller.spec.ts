import { Test, TestingModule } from '@nestjs/testing';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  MockJwtAuthGuard,
  MockPermissionsGuard,
} from '../../../test/mocks/guards.mock';

describe('SamplesController', () => {
  let controller: SamplesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SamplesController],
      providers: [
        {
          provide: SamplesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 's-1' }),
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

    controller = module.get<SamplesController>(SamplesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

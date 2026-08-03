import { Test, TestingModule } from '@nestjs/testing';
import { ReplacementsController } from './replacements.controller';
import { ReplacementsService } from './replacements.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  MockJwtAuthGuard,
  MockPermissionsGuard,
} from '../../../test/mocks/guards.mock';

describe('ReplacementsController', () => {
  let controller: ReplacementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplacementsController],
      providers: [
        {
          provide: ReplacementsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'r-1' }),
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

    controller = module.get<ReplacementsController>(ReplacementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

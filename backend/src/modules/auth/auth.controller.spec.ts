import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ElevationGuard } from '../../common/guards/elevation.guard';
import {
  MockJwtAuthGuard,
  MockPermissionsGuard,
  MockElevationGuard,
} from '../../../test/mocks/guards.mock';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              accessToken: 'access',
              refreshToken: 'refresh',
            }),
            logout: jest.fn().mockResolvedValue({ success: true }),
            refreshTokens: jest.fn().mockResolvedValue({
              accessToken: 'access',
              refreshToken: 'refresh',
            }),
          },
        },
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useClass(MockPermissionsGuard)
      .overrideGuard(ElevationGuard)
      .useClass(MockElevationGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

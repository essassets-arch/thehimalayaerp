import { Test, TestingModule } from '@nestjs/testing';
import { ReplacementsService } from './replacements.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('ReplacementsService', () => {
  let service: ReplacementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReplacementsService,
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<ReplacementsService>(ReplacementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

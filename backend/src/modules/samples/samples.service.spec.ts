import { Test, TestingModule } from '@nestjs/testing';
import { SamplesService } from './samples.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('SamplesService', () => {
  let service: SamplesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SamplesService,
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<SamplesService>(SamplesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SalesReturnsService } from './sales-returns.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('SalesReturnsService', () => {
  let service: SalesReturnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesReturnsService,
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<SalesReturnsService>(SalesReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

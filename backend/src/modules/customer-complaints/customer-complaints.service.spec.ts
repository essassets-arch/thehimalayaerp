import { Test, TestingModule } from '@nestjs/testing';
import { CustomerComplaintsService } from './customer-complaints.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('CustomerComplaintsService', () => {
  let service: CustomerComplaintsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerComplaintsService,
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<CustomerComplaintsService>(CustomerComplaintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

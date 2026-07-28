import { Test, TestingModule } from '@nestjs/testing';
import { CustomerComplaintsService } from './customer-complaints.service';

describe('CustomerComplaintsService', () => {
  let service: CustomerComplaintsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerComplaintsService],
    }).compile();

    service = module.get<CustomerComplaintsService>(CustomerComplaintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

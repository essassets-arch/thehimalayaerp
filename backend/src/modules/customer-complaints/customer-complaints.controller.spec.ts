import { Test, TestingModule } from '@nestjs/testing';
import { CustomerComplaintsController } from './customer-complaints.controller';

describe('CustomerComplaintsController', () => {
  let controller: CustomerComplaintsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerComplaintsController],
    }).compile();

    controller = module.get<CustomerComplaintsController>(
      CustomerComplaintsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

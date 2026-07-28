import { Test, TestingModule } from '@nestjs/testing';
import { ReplacementsController } from './replacements.controller';

describe('ReplacementsController', () => {
  let controller: ReplacementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplacementsController],
    }).compile();

    controller = module.get<ReplacementsController>(ReplacementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

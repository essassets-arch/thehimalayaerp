import { Module } from '@nestjs/common';
import { ReplacementsController } from './replacements.controller';
import { ReplacementsService } from './replacements.service';

@Module({
  controllers: [ReplacementsController],
  providers: [ReplacementsService]
})
export class ReplacementsModule {}

import { IsNumber, Min } from 'class-validator';

export class SendOrderToPlantHeadDto {
  @IsNumber()
  @Min(1)
  expectedVersion: number;
}

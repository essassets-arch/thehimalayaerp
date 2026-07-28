import { IsString, IsNumber, Min } from 'class-validator';

export class CancelSalesOrderDto {
  @IsString()
  reason: string;

  @IsNumber()
  @Min(1)
  expectedVersion: number;
}

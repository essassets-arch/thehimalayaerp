import { IsNumber, Min } from 'class-validator';

export class ConfirmSalesOrderDto {
  @IsNumber()
  @Min(1)
  expectedVersion: number;
}

import { IsNumber, Min } from 'class-validator';

export class RunCreditCheckDto {
  @IsNumber()
  @Min(1)
  expectedVersion: number;
}

import { IsString, IsNumber, Min } from 'class-validator';

export class ApproveCreditExceptionDto {
  @IsString()
  approvalRemarks: string;

  @IsNumber()
  @Min(1)
  expectedVersion: number;
}

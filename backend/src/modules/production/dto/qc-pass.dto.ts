import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QcPassDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  approvedQuantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  rejectedQuantity?: number = 0;

  @IsString()
  @IsOptional()
  remarks?: string;
}

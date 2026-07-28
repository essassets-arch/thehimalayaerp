import { IsString, IsInt } from 'class-validator';

export class MarkLeadLostDto {
  @IsString()
  lostReason: string;

  @IsInt()
  expectedVersion: number;
}

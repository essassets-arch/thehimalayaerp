import { IsString, IsOptional, IsInt, IsISO8601 } from 'class-validator';

export class AddFollowupDto {
  @IsString()
  followupType: string;

  @IsString()
  notes: string;

  @IsOptional()
  @IsISO8601()
  nextActionAt?: string;

  @IsInt()
  expectedVersion: number;
}
